<template>
  <Teleport to="body">
    <div v-if="isVisible" class="active-order-modal-overlay">
      <!-- Minimized State -->
      <div v-if="isMinimized" class="active-order-modal minimized" @click="isMinimized = false" title="Click para expandir">
        <div class="minimized-content">
          <span class="order-badge">Orden #{{ session.order_number }}</span>
          <span class="time-badge">{{ formatCountdown(secondsRemaining) }}</span>
        </div>
      </div>

      <!-- Full State -->
      <div v-else class="active-order-modal">
        <!-- Orden Info -->
        <div class="modal-header">
          <h2 class="order-number">Orden #{{ session.order_number }}</h2>
          <p class="order-time">Reserva válida hasta:</p>
        </div>

        <!-- Countdown -->
        <div class="countdown-section">
          <div :class="['countdown', countdownClass]">
            {{ formatCountdown(secondsRemaining) }}
          </div>
          <p class="countdown-label">minutos y segundos</p>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button
            @click.stop="handleManualPaymentCheck"
            class="btn btn-success"
            :disabled="isCheckingPayment || !session.payment_ticket_id"
          >
            {{ isCheckingPayment ? 'Consultando...' : 'Ya hice el pago' }}
          </button>
          <button @click="handleContinue" class="btn btn-primary">
            ✓ Continuar con Pago
          </button>
          <button
            @click="handleRestart"
            class="btn btn-danger"
            :disabled="isRestarting"
          >
            {{ isRestarting ? 'Cancelando...' : '↻ Empezar de Nuevo' }}
          </button>
        </div>
        <p v-if="statusMessage" :class="['status-message', statusMessageType]">
          {{ statusMessage }}
        </p>

        <!-- Auto-expire message if close to zero -->
        <div v-if="secondsRemaining < 60" class="expiring-soon">
          ⏰ Tu orden expira pronto
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { paymentMethodService } from '@/services/PaymentMethodService'

const router = useRouter()
const cartStore = useCartStore()
const isMinimized = ref(false)
const isCheckingPayment = ref(false)
const isRestarting = ref(false)
const statusMessage = ref('')
const statusMessageType = ref('info')

// Expose
const isVisible = computed(() => cartStore.isSessionActive)
const session = computed(() => cartStore.currentSession || {})
const secondsRemaining = computed(() => cartStore.secondsRemaining)

// UI Helpers
const countdownClass = computed(() => {
  return secondsRemaining.value < 60 ? 'warning' : ''
})

const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const persistCancelSnapshot = (cancelResponse, orderNumber) => {
  try {
    localStorage.setItem('cinea_last_cancel_response', JSON.stringify({
      at: new Date().toISOString(),
      order_number: orderNumber,
      response: cancelResponse
    }))
  } catch (err) {
    console.warn('Error saving cancel snapshot:', err)
  }
}

// Actions
const handleContinue = () => {
  isMinimized.value = true
  router.push('/checkout')
}

const handleRestart = async () => {
  if (isRestarting.value) return

  const orderNumber = session.value?.order_number
  if (!orderNumber) {
    statusMessageType.value = 'error'
    statusMessage.value = 'No se encontro un numero de orden para cancelar.'
    return
  }

  isRestarting.value = true
  statusMessageType.value = 'info'
  statusMessage.value = 'Cancelando reserva...'

  try {
    const cancelResponse = await paymentMethodService.cancelOrderByNumber(orderNumber)

    if (cancelResponse?.success) {
      cartStore.resetAll()
      router.push('/')
      return
    }

    persistCancelSnapshot(cancelResponse, orderNumber)
    cartStore.resetAll()
    statusMessageType.value = cancelResponse?.error_code === 'ORDER_HAS_TICKETS' ? 'info' : 'error'
    statusMessage.value = cancelResponse?.message || 'No se pudo cancelar la reserva. Intenta nuevamente.'
    router.push('/')
  } catch (err) {
    console.warn('Error cancelling payment:', err)
    statusMessageType.value = 'error'
    statusMessage.value = 'No se pudo cancelar la reserva. Intenta nuevamente.'
  } finally {
    isRestarting.value = false
  }
}

const normalizePaymentStatus = (statusResponse) => {
  const rawStatus = statusResponse?.status || statusResponse?.payment?.status
  return typeof rawStatus === 'string' ? rawStatus.trim().toLowerCase() : ''
}

const handleManualPaymentCheck = async () => {
  if (!session.value?.payment_ticket_id || isCheckingPayment.value) return

  isCheckingPayment.value = true
  statusMessage.value = ''

  try {
    let statusResponse = null
    try {
      statusResponse = await paymentMethodService.manualCheckPayment({
        payment_ticket_id: session.value.payment_ticket_id,
        order_number: session.value.order_number,
        order_id: session.value.order_id,
        payment_provider_id: session.value.provider_id
      })
    } catch (manualErr) {
      // Fallback temporal mientras se habilita el endpoint manual en backend.
      statusResponse = await paymentMethodService.monitorPayment(session.value.payment_ticket_id)
      console.warn('Manual check endpoint no disponible; usando monitorPayment como fallback:', manualErr)
    }

    const normalizedStatus = normalizePaymentStatus(statusResponse)

    if (normalizedStatus === 'completed' || normalizedStatus === 'approved') {
      const orderNumber = session.value?.order_number || undefined
      cartStore.clearPaymentSession()
      router.push({
        name: 'PaymentSuccess',
        query: {
          ticket: session.value.payment_ticket_id,
          ...(orderNumber ? { order: orderNumber } : {})
        }
      })
      return
    }

    if (normalizedStatus === 'rejected' || normalizedStatus === 'declined') {
      statusMessageType.value = 'error'
      statusMessage.value = statusResponse?.message || statusResponse?.payment?.message || 'El pago fue rechazado.'
      return
    }

    statusMessageType.value = 'info'
    statusMessage.value = 'El pago aún no figura acreditado. Intenta nuevamente en unos segundos.'
  } catch (err) {
    console.warn('Error checking payment status from modal:', err)
    statusMessageType.value = 'error'
    statusMessage.value = 'No se pudo consultar el estado del pago.'
  } finally {
    isCheckingPayment.value = false
  }
}

// Auto-expire when countdown reaches zero
let expireCheckInterval = null

const checkExpiration = () => {
  if (isVisible.value && secondsRemaining.value <= 0) {
    handleRestart()
  }
}

onMounted(() => {
  expireCheckInterval = setInterval(checkExpiration, 1000)
})

onUnmounted(() => {
  if (expireCheckInterval) clearInterval(expireCheckInterval)
})
</script>

<style scoped>
.active-order-modal-overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  animation: slideIn 0.15s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(300px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.active-order-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 1rem;
  max-width: 280px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.active-order-modal.minimized {
  padding: 0.75rem 1rem;
  max-width: none;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.active-order-modal.minimized:hover {
  background: rgba(26, 26, 26, 0.98);
  box-shadow: 0 5px 20px rgba(59, 130, 246, 0.3);
  transform: scale(1.02);
}

.minimized-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.order-badge {
  color: var(--primary);
  font-weight: 600;
  white-space: nowrap;
}

.time-badge {
  background: rgba(59, 130, 246, 0.2);
  color: var(--primary);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  white-space: nowrap;
}

.modal-header {
  text-align: center;
  margin-bottom: 1rem;
}

.order-number {
  font-size: 1.5rem;
  margin: 0;
  color: var(--primary);
}

.order-time {
  font-size: 0.85rem;
  color: #999;
  margin: 0.3rem 0 0 0;
}

.countdown-section {
  text-align: center;
  margin: 1rem 0;
}

.countdown {
  font-size: 2.5rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: #4ade80;
}

.countdown.warning {
  color: #f97316;
  animation: pulse 0.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.countdown-label {
  font-size: 0.8rem;
  color: #999;
  margin: 0.3rem 0 0 0;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-direction: column;
}

.btn {
  flex: 1;
  padding: 0.65rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  transform: scale(1.02);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-success {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid #4ade80;
}

.btn-success:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-message {
  margin: 0.65rem 0 0 0;
  font-size: 0.8rem;
  text-align: center;
}

.status-message.info {
  color: #93c5fd;
}

.status-message.error {
  color: #fca5a5;
}

.expiring-soon {
  text-align: center;
  margin-top: 0.75rem;
  color: #f97316;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 640px) {
  .active-order-modal-overlay {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }

  .active-order-modal {
    max-width: none;
  }

  .countdown {
    font-size: 2rem;
  }

  .minimized-content {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .order-badge,
  .time-badge {
    font-size: 0.8rem;
  }
}
</style>
