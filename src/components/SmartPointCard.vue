<template>
  <div class="smart-point-card">
    <!-- Loading State -->
    <div v-if="isLoading" class="terminal-state terminal-loading">
      <div class="spinner"></div>
      <p>Inicializando terminal...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="terminal-state terminal-error">
      <div class="error-icon">❌</div>
      <h3>Error en la Terminal</h3>
      <p>{{ error }}</p>
      <button @click="initializeTerminal" class="btn btn-primary">Reintentar</button>
    </div>

    <!-- Waiting for Payment -->
    <div v-else-if="orderInitialized && !paymentCompleted" class="terminal-state terminal-waiting">
      <!-- Ticket Display with Instructions -->
      <PaymentTicketDisplay
        :ticket-number="orderId"
        :amount="displayAmount"
        payment-method="terminal"
        :status-text="getStatusText(currentStatus)"
      />

      <!-- Terminal Display Container -->
      <div class="terminal-display-section">
        <h3>Terminal Smart Point</h3>
        <div class="terminal-display">
          <div class="display-content">
            <div class="terminal-amount">
              <span class="currency">$</span>
              <span class="amount">{{ displayAmount.toFixed(2) }}</span>
            </div>
            <p class="display-status">{{ displayStatus }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback State - Show if nothing matches -->
    <div v-else class="terminal-fallback">
      <div class="spinner"></div>
      <p>Inicializando terminal Smart Point...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { paymentMethodService } from '@/services/PaymentMethodService'
import { useCartStore } from '@/stores/cartStore'
import { processPaymentErrorMessage } from '@/utils/errorHelpers'
import PaymentTicketDisplay from '@/components/PaymentTicketDisplay.vue'

const cartStore = useCartStore()

const props = defineProps({
  paymentProviderId: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  screeningId: {
    type: Number,
    required: true
  },
  seatIds: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  terminalId: {
    type: String,
    default: 'TERMINAL_001'
  },
  customerEmail: {
    type: String,
    default: ''
  },
  customerName: {
    type: String,
    default: ''
  },
  timeoutDuration: {
    type: Number,
    default: 300 // 5 minutes
  }
})

const emit = defineEmits(['payment-success', 'payment-error', 'payment-cancelled'])

// State
const isLoading = ref(false)
const error = ref(null)
const orderInitialized = ref(false)
const paymentCompleted = ref(false)
const orderId = ref(null)
const currentStatus = ref('waiting') // waiting, processing, completed, rejected
const rejectionReason = ref('')
const timeoutSeconds = ref(props.timeoutDuration)
const payableAmount = ref(Number(props.amount) || 0)
let monitoringInterval = null
let timeoutInterval = null

const displayStatus = ref('Acerca tu tarjeta')
const statusMessages = {
  waiting: 'Esperando transacción',
  processing: 'Procesando...',
  completed: '✓ Aceptado',
  rejected: '✗ Rechazado'
}

const displayAmount = computed(() => {
  const amount = Number(payableAmount.value)
  return Number.isFinite(amount) ? amount : 0
})

const normalizeSeatIds = (seatIds = []) => [...seatIds].map(id => String(id)).sort()
const normalizeProducts = (products = []) => [...products]
  .map(product => ({
    code: String(product?.code || '').trim().toUpperCase(),
    quantity: Number(product?.quantity) || 0
  }))
  .filter(product => product.code && product.quantity > 0)
  .sort((a, b) => a.code.localeCompare(b.code))

const isSameSeatSelection = (left = [], right = []) => {
  const a = normalizeSeatIds(left)
  const b = normalizeSeatIds(right)
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

const isSameProductSelection = (left = [], right = []) => {
  const a = normalizeProducts(left)
  const b = normalizeProducts(right)
  if (a.length !== b.length) return false
  return a.every((product, index) => {
    const other = b[index]
    return product.code === other.code && product.quantity === other.quantity
  })
}

const getIdempotencyKey = () => {
  const session = cartStore.currentSession
  return session?.idempotency_key || null
}

const getReusableOrderNumber = () => {
  const session = cartStore.currentSession
  if (!session) return null

  const sameScreening = Number(session.screening_id) === Number(props.screeningId)
  const sameSeats = isSameSeatSelection(session.seat_ids || [], props.seatIds)
  const sameProducts = isSameProductSelection(session.products || [], props.products || [])

  return sameScreening && sameSeats && sameProducts ? session.order_number : null
}

const canReuseActiveSession = () => {
  const session = cartStore.currentSession
  if (!session || !cartStore.isSessionActive) return false

  const sameMethod = session.payment_method === 'terminal'
  const sameProvider = Number(session.provider_id) === Number(props.paymentProviderId)
  const sameScreening = Number(session.screening_id) === Number(props.screeningId)
  const sameSeats = isSameSeatSelection(session.seat_ids || [], props.seatIds)
  const sameProducts = isSameProductSelection(session.products || [], props.products || [])
  const hasTicket = !!session.payment_ticket_id

  return sameMethod && sameProvider && sameScreening && sameSeats && sameProducts && hasTicket
}

const restoreSession = () => {
  const session = cartStore.currentSession
  if (!session) return false

  orderId.value = session.order_id || session.order_number
  payableAmount.value = Number.isFinite(Number(session.total_price))
    ? Number(session.total_price)
    : Number(props.amount) || 0
  orderInitialized.value = true
  currentStatus.value = 'waiting'
  displayStatus.value = 'Acerca tu tarjeta'
  startMonitoring()
  return true
}

const normalizePaymentStatus = (statusResponse) => {
  const rawStatus = statusResponse?.status
  return typeof rawStatus === 'string' ? rawStatus.trim().toLowerCase() : ''
}

/**
 * Inicializar terminal
 */
const initializeTerminal = async () => {
  isLoading.value = true
  error.value = null

  try {
    const reusableOrderNumber = getReusableOrderNumber()
    const sessionOrderNumber = cartStore.currentSession?.order_number || null
    const idempotencyKey = getIdempotencyKey()
    const selectedProducts = normalizeProducts(props.products || [])
    // Procesar pago terminal en backend
    const response = await paymentMethodService.processTerminalPayment({
      payment_provider_id: props.paymentProviderId,
      screening_id: props.screeningId,
      seat_ids: props.seatIds,
      products: selectedProducts,
      order_number: reusableOrderNumber || sessionOrderNumber || null,
      idempotency_key: idempotencyKey || undefined,
      customer_email: props.customerEmail || 'default@gmail.com',
      customer_name: props.customerName || 'default'
    })

    if (!response || !response.success) {
      throw new Error(response?.message || 'Error inicializando terminal')
    }

    // Guardar sesión de pago en cartStore
    cartStore.setPaymentSession({
      order_id: response.order_id,
      order_number: response.order_number,
      reserved_until: response.reserved_until,
      payment_ticket_id: response.payment_ticket_id,
      payment_method: 'terminal',
      provider_id: props.paymentProviderId,
      screening_id: props.screeningId,
      seat_ids: props.seatIds,
      products: normalizeProducts(response.products || selectedProducts),
      idempotency_key: response.idempotency_key || idempotencyKey || undefined,
      total_price: Number.isFinite(Number(response.total_price))
        ? Number(response.total_price)
        : undefined,
      base_subtotal: Number.isFinite(Number(response.base_subtotal))
        ? Number(response.base_subtotal)
        : undefined,
      total_discount: Number.isFinite(Number(response.total_discount))
        ? Number(response.total_discount)
        : undefined,
      applied_promotions: Array.isArray(response.applied_promotions)
        ? response.applied_promotions
        : [],
      order_items: Array.isArray(response.order_items)
        ? response.order_items
        : []
    })

    const backendTotal = Number(response.total_price)
    payableAmount.value = Number.isFinite(backendTotal)
      ? backendTotal
      : Number(props.amount) || 0

    // Guardar datos de la orden
    orderId.value = response.order_id
    orderInitialized.value = true
    currentStatus.value = 'waiting'
    displayStatus.value = 'Acerca tu tarjeta'

    // Iniciar monitoreo
    startMonitoring()
  } catch (err) {
    console.error('Error initializing terminal:', err)
    
    // Procesar el mensaje de error
    const errorMessage = err?.message || err?.response?.data?.message || 'Error inicializando terminal'
    const processedError = processPaymentErrorMessage(errorMessage)
    error.value = processedError
    emit('payment-error', error.value)
    return
  } finally {
    isLoading.value = false
  }
}

/**
 * Monitorear estado de pago de terminal
 */
const startMonitoring = () => {
  timeoutSeconds.value = props.timeoutDuration

  // Verificar estado cada 4 segundos
  monitoringInterval = setInterval(async () => {
    try {
      const paymentTicketId = cartStore.currentSession?.payment_ticket_id
      if (!paymentTicketId) return

      const status = await paymentMethodService.monitorPayment(paymentTicketId)

      const normalizedStatus = normalizePaymentStatus(status)
      if (normalizedStatus) {
        if (normalizedStatus === 'completed' || normalizedStatus === 'approved') {
          currentStatus.value = 'completed'
          displayStatus.value = '✓ Pago confirmado'
          paymentCompleted.value = true
          stopMonitoring()
          emit('payment-success', {
            orderId: orderId.value,
            paymentTicketId,
            amount: displayAmount.value
          })
        } else if (normalizedStatus === 'rejected' || normalizedStatus === 'declined') {
          currentStatus.value = 'rejected'
          rejectionReason.value = status.message || 'Tarjeta rechazada'
          displayStatus.value = '✗ Rechazado'
          // Reiniciar después de 3 segundos
          setTimeout(() => {
            resetForNewAttempt()
          }, 3000)
        } else if (normalizedStatus === 'processing') {
          currentStatus.value = 'processing'
          displayStatus.value = 'Procesando...'
        }
      }
    } catch (err) {
      console.warn('Error checking terminal payment status:', err)
    }
  }, 4000)

  // Contar tiempo hacia atrás
  timeoutInterval = setInterval(() => {
    timeoutSeconds.value--
    if (timeoutSeconds.value <= 0) {
      stopMonitoring()
      error.value = 'Tiempo de espera expirado. Por favor, intenta de nuevo.'
      emit('payment-error', error.value)
    }
  }, 1000)
}

/**
 * Detener monitoreo
 */
const stopMonitoring = () => {
  if (monitoringInterval) clearInterval(monitoringInterval)
  if (timeoutInterval) clearInterval(timeoutInterval)
}

/**
 * Reiniciar para nuevo intento
 */
const resetForNewAttempt = () => {
  currentStatus.value = 'waiting'
  rejectionReason.value = ''
  displayStatus.value = 'Acerca tu tarjeta'
  timeoutSeconds.value = props.timeoutDuration
  startMonitoring()
}

/**
 * Cancelar operación
 */
const cancelPayment = async () => {
  try {
    stopMonitoring()
    if (cartStore.currentSession?.payment_ticket_id) {
      await paymentMethodService.cancelPayment(cartStore.currentSession.payment_ticket_id)
    }
    cartStore.clearPaymentSession()
    emit('payment-cancelled')
    // Reset state
    orderInitialized.value = false
    orderId.value = null
    error.value = null
  } catch (err) {
    error.value = 'Error al cancelar operación'
    console.error('Error cancelling payment:', err)
  }
}

/**
 * Obtener texto del estado
 */
const getStatusText = (status) => {
  return statusMessages[status] || 'Esperando'
}

/**
 * Formatear tiempo en MM:SS
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Ciclo de vida
onMounted(() => {
  if (canReuseActiveSession() && restoreSession()) {
    return
  }

  initializeTerminal()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.smart-point-card {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.terminal-state {
  text-align: center;
  padding: 2rem 0;
}

.terminal-loading,
.terminal-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #3d3d3d;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 3px solid #3d3d3d;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.terminal-error {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.terminal-error h3 {
  color: #ff6b6b;
  margin-bottom: 0.5rem;
}

.terminal-error p {
  color: #ccc;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.terminal-waiting {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.terminal-header {
  margin-bottom: 1rem;
}

.terminal-header h3 {
  color: var(--primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.terminal-subtitle {
  color: #999;
  margin: 0;
  font-size: 0.9rem;
}

.terminal-display {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid var(--primary);
  border-radius: 8px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.terminal-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.05);
  pointer-events: none;
}

.display-content {
  position: relative;
  z-index: 1;
}

.terminal-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.currency {
  font-size: 1.5rem;
  color: var(--primary);
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
  font-family: monospace;
}

.display-status {
  color: #999;
  margin: 0;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.device-info {
  background: #1a1a1a;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #3d3d3d;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #999;
  font-weight: 500;
}

.value {
  color: white;
  font-weight: 600;
}

.value.mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.payment-status {
  background: #1a1a1a;
  border-radius: 4px;
  border: 1px solid #3d3d3d;
  padding: 1.5rem;
}

.payment-status.status-waiting {
  border-color: #666;
  background: rgba(59, 130, 246, 0.05);
}

.payment-status.status-processing {
  border-color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
}

.payment-status.status-completed {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.payment-status.status-rejected {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.waiting {
  background: #fbbf24;
  animation: pulse 1.5s infinite;
}

.status-dot.processing {
  background: var(--primary);
  animation: pulse 1s infinite;
}

.status-dot.completed {
  background: #4ade80;
}

.status-dot.rejected {
  background: #ff6b6b;
}

.status-text {
  color: white;
}

.status-instructions {
  text-align: center;
}

.status-instructions p {
  margin: 0.5rem 0;
  color: #ccc;
  font-size: 0.95rem;
}

.status-instructions .small {
  color: #999;
  font-size: 0.85rem;
}

.status-instructions.success {
  color: #4ade80;
}

.status-instructions.success p {
  color: #4ade80;
  font-weight: 600;
}

.status-instructions.error {
  color: #ff6b6b;
}

.status-instructions.error p {
  color: #ff6b6b;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.supported-cards {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #3d3d3d;
}

.cards-title {
  margin: 0 0 0.75rem 0;
  color: #999;
  font-size: 0.9rem;
  font-weight: 500;
}

.cards-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card-type {
  background: #2d2d2d;
  padding: 0.4rem 0.8rem;
  border-radius: 3px;
  color: #ccc;
  font-size: 0.85rem;
  border: 1px solid #3d3d3d;
}

.terminal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary);
  color: white;
  flex: 1;
  min-width: 120px;
}

.btn-primary:hover:not(:disabled) {
  background: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  flex: 1;
  min-width: 120px;
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff8787;
}

.terminal-completed {
  background: rgba(74, 222, 128, 0.1);
  border: 2px solid #4ade80;
  padding: 3rem 2rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.success-icon {
  font-size: 4rem;
  color: #4ade80;
}

.terminal-completed h3 {
  color: #4ade80;
  margin: 0;
  font-size: 1.5rem;
}

.terminal-completed p {
  color: #ccc;
  margin: 0;
  margin-bottom: 1rem;
}

.completion-details {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 4px;
  width: 100%;
}

.completion-details p {
  margin: 0.5rem 0;
  color: #aaa;
  font-size: 0.9rem;
}

/* Fallback State */
.terminal-fallback {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1.5rem;
}

.terminal-fallback .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #3d3d3d;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.terminal-fallback p {
  color: #999;
  font-size: 0.95rem;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .smart-point-card {
    padding: 1.5rem;
    margin: 1.5rem 0;
  }

  .terminal-amount {
    margin-bottom: 0.75rem;
  }

  .amount {
    font-size: 2rem;
  }

  .terminal-actions {
    flex-direction: column;
  }

  .device-info {
    padding: 1rem;
  }

  .info-row {
    margin-bottom: 0.75rem;
  }

  .payment-status {
    padding: 1rem;
  }
}
</style>
