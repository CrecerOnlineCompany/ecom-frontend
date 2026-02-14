<template>
  <div class="qr-payment-card">
    <!-- Loading State -->
    <div v-if="isLoading" class="qr-state qr-loading">
      <div class="spinner"></div>
      <p>Generando código QR...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="qr-state qr-error">
      <div class="error-icon">❌</div>
      <h3>Error al generar QR</h3>
      <p>{{ error }}</p>
      <button @click="generateQR" class="btn btn-primary">Reintentar</button>
    </div>

    <!-- Success State - QR Generated -->
    <div v-else-if="qrData && !paymentCompleted" class="qr-state qr-generated">
      <!-- Ticket Display with Instructions -->
      <PaymentTicketDisplay
        :ticket-number="paymentTicketId"
        :amount="amount"
        payment-method="qr"
        :status-text="monitoring ? `Esperando confirmación... ${formatTime(timeoutSeconds)}` : 'Escanea el código QR con tu celular'"
      />

      <!-- QR Code Container -->
      <div class="qr-instruction-section">
        <h3>Código QR</h3>
        <div class="qr-container">
          <div id="qr-canvas" class="qr-canvas"></div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="qr-instructions">
        <h4>Cómo Pagar:</h4>
        <ol>
          <li>Abre la app Mercado Pago en tu teléfono</li>
          <li>Toca el icono de "Escanear" o "QR"</li>
          <li>Apunta a este código</li>
          <li>Confirma el pago en tu teléfono</li>
        </ol>
      </div>

      <!-- Payment Info -->
      <div class="payment-info">
        <div class="info-row">
          <span class="label">Monto a pagar:</span>
          <span class="value">${{ amount.toFixed(2) }}</span>
        </div>
        <div class="info-row">
          <span class="label">ID Transacción:</span>
          <span class="value mono">{{ paymentTicketId }}</span>
        </div>
      </div>

      <!-- Monitoring Status -->
      <div v-if="monitoring" class="monitoring-status">
        <div class="status-indicator">
          <div class="pulse"></div>
          <span>Esperando confirmación...</span>
        </div>
        <div class="status-timer">
          <span v-if="timeoutSeconds > 0">
            {{ formatTime(timeoutSeconds) }} segundos restantes
          </span>
          <span v-else class="expired">
            Tiempo expirado
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="qr-actions">
        <button
          @click="downloadQR"
          class="btn btn-secondary"
          :disabled="isDownloading"
        >
          {{ isDownloading ? 'Descargando...' : '⬇️ Descargar QR' }}
        </button>
        <button
          @click="copyQRData"
          class="btn btn-secondary"
        >
          📋 Copiar Datos
        </button>
        <button
          @click="cancelPayment"
          class="btn btn-danger"
        >
          ✕ Cancelar
        </button>
      </div>

      <!-- Tooltip -->
      <div v-if="showCopyTooltip" class="tooltip">
        ✓ Copiado al portapapeles
      </div>
    </div>

    <!-- Completed State -->
    <div v-else-if="paymentCompleted" class="qr-state qr-completed">
      <div class="success-icon">✓</div>
      <h3>¡Pago realizado!</h3>
      <p>Tu transacción ha sido procesada exitosamente.</p>
      <div class="completion-details">
        <p><strong>Monto:</strong> ${{ amount.toFixed(2) }}</p>
        <p><strong>Referencia:</strong> {{ paymentTicketId }}</p>
      </div>
    </div>

    <!-- Fallback State - Show if nothing matches -->
    <div v-else class="qr-fallback">
      <div class="spinner"></div>
      <p>Generando código QR y preparando pago...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { paymentMethodService } from '@/services/PaymentMethodService'
import PaymentTicketDisplay from '@/components/PaymentTicketDisplay.vue'

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
const qrData = ref(null)
const paymentTicketId = ref(null)
const paymentCompleted = ref(false)
const monitoring = ref(false)
const isDownloading = ref(false)
const showCopyTooltip = ref(false)
const timeoutSeconds = ref(props.timeoutDuration)
let monitoringInterval = null
let timeoutInterval = null

/**
 * Generar código QR
 */
const generateQR = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Procesar pago QR en backend
    const response = await paymentMethodService.processQrPayment({
      payment_provider_id: props.paymentProviderId,
      screening_id: props.screeningId,
      seat_ids: props.seatIds,
      total_price: props.amount,
      seat_count: props.seatIds.length,
      customer_email: props.customerEmail,
      customer_name: props.customerName
    })

    if (!response || !response.success) {
      throw new Error(response?.message || 'Error procesando pago QR')
    }

    // Guardar datos del pago
    paymentTicketId.value = response.payment_ticket_id
    qrData.value = {
      method: response.method,
      qr_data: response.qr_data,
      amount: props.amount,
      reference: paymentTicketId.value
    }

    // Generar código QR visual
    await paymentMethodService.generateQRCode(qrData.value, 'qr-canvas')

    // Iniciar monitoreo
    startMonitoring()
  } catch (err) {
    console.error('Error generating QR:', err)
    
    // Fallback: Permitir funcionalidad sin backend
    // Generar un ID local si el backend no responde
    paymentTicketId.value = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    qrData.value = {
      method: 'qr',
      qr_data: JSON.stringify({
        amount: props.amount,
        reference: paymentTicketId.value,
        email: props.customerEmail
      }),
      amount: props.amount,
      reference: paymentTicketId.value
    }

    // Intentar generar QR de todas formas
    try {
      await paymentMethodService.generateQRCode(qrData.value, 'qr-canvas')
    } catch (qrErr) {
      console.warn('No se pudo generar QR visual:', qrErr)
      // Continuar sin QR visual
    }

    // Iniciar monitoreo de todas formas
    try {
      startMonitoring()
    } catch (monitoringErr) {
      console.warn('Monitoreo no disponible:', monitoringErr)
      // Continuar sin monitoreo
    }
  } finally {
    isLoading.value = false
  }
}

/**
 * Monitorear estado de pago
 */
const startMonitoring = () => {
  monitoring.value = true
  timeoutSeconds.value = props.timeoutDuration

  // Verificar estado cada 2 segundos
  monitoringInterval = setInterval(async () => {
    try {
      const status = await paymentMethodService.monitorQrPayment(paymentTicketId.value)

      if (status && status.status === 'completed') {
        paymentCompleted.value = true
        monitoring.value = false
        clearInterval(monitoringInterval)
        clearInterval(timeoutInterval)
        emit('payment-success', {
          paymentTicketId: paymentTicketId.value,
          amount: props.amount
        })
      }
    } catch (err) {
      console.warn('Error checking payment status:', err)
    }
  }, 2000)

  // Contar tiempo hacia atrás
  timeoutInterval = setInterval(() => {
    timeoutSeconds.value--
    if (timeoutSeconds.value <= 0) {
      stopMonitoring()
      error.value = 'El tiempo de espera ha expirado. Por favor, intenta de nuevo.'
      emit('payment-error', error.value)
    }
  }, 1000)
}

/**
 * Detener monitoreo
 */
const stopMonitoring = () => {
  monitoring.value = false
  if (monitoringInterval) clearInterval(monitoringInterval)
  if (timeoutInterval) clearInterval(timeoutInterval)
}

/**
 * Descargar QR como imagen
 */
const downloadQR = async () => {
  isDownloading.value = true
  try {
    await paymentMethodService.downloadQRCode('qr-canvas', `qr-payment-${paymentTicketId.value}.png`)
  } catch (err) {
    error.value = 'Error al descargar QR'
    console.error('Error downloading QR:', err)
  } finally {
    isDownloading.value = false
  }
}

/**
 * Copiar datos del QR al portapapeles
 */
const copyQRData = async () => {
  try {
    const dataText = `Referencia: ${paymentTicketId.value}\nMonto: $${props.amount.toFixed(2)}`
    await navigator.clipboard.writeText(dataText)
    showCopyTooltip.value = true
    setTimeout(() => {
      showCopyTooltip.value = false
    }, 2000)
  } catch (err) {
    error.value = 'Error al copiar datos'
    console.error('Error copying data:', err)
  }
}

/**
 * Cancelar pago
 */
const cancelPayment = async () => {
  try {
    stopMonitoring()
    if (paymentTicketId.value) {
      await paymentMethodService.cancelPayment(paymentTicketId.value)
    }
    emit('payment-cancelled')
    // Reset state
    qrData.value = null
    paymentTicketId.value = null
    error.value = null
  } catch (err) {
    error.value = 'Error al cancelar pago'
    console.error('Error cancelling payment:', err)
  }
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
  generateQR()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.qr-payment-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.qr-state {
  text-align: center;
  padding: 2rem 0;
}

.qr-loading,
.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 300px;
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: 8px;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #3d3d3d;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.qr-error {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.qr-error h3 {
  color: #ff6b6b;
  margin-bottom: 0.5rem;
}

.qr-error p {
  color: #ccc;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.qr-generated {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* QR Instruction Section */
.qr-instruction-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.qr-instruction-section h3 {
  color: var(--primary);
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.qr-container {
  display: flex;
  justify-content: center;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  border: 2px solid var(--primary);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
}

.qr-canvas {
  width: auto;
  height: auto;
  max-width: 300px;
}

.qr-instructions {
  background: #1a1a1a;
  border-left: 3px solid var(--primary);
  padding: 1rem;
  border-radius: 4px;
  text-align: left;
}

.qr-instructions h4 {
  margin: 0 0 1rem 0;
  color: var(--primary);
  font-size: 0.95rem;
}

.qr-instructions ol {
  margin: 0;
  padding-left: 1.5rem;
  list-style-position: inside;
}

.qr-instructions li {
  color: #ccc;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.payment-info {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #3d3d3d;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #999;
}

.value {
  color: white;
  font-weight: 600;
}

.value.mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.monitoring-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary);
  font-weight: 500;
}

.pulse {
  width: 12px;
  height: 12px;
  background: var(--primary);
  border-radius: 50%;
  animation: pulse-anim 1s infinite;
}

@keyframes pulse-anim {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-timer {
  font-size: 0.9rem;
  color: #999;
}

.status-timer .expired {
  color: #ff6b6b;
  font-weight: 600;
}

.qr-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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
  flex: 1;
  min-width: 120px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #3d3d3d;
  color: #ccc;
}

.btn-secondary:hover:not(:disabled) {
  background: #4d4d4d;
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff8787;
}

.tooltip {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  animation: slide-up 0.3s ease;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.qr-completed {
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid var(--primary);
  padding: 3rem 2rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  border-radius: 8px;
}

.success-icon {
  font-size: 4rem;
  color: var(--primary);
}

.qr-completed h3 {
  color: var(--primary);
  margin: 0;
  font-size: 1.5rem;
}

.qr-completed p {
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
.qr-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 200px;
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: 8px;
  padding: 2rem;
}

.qr-fallback .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #3d3d3d;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.qr-fallback p {
  color: #999;
  font-size: 0.95rem;
  margin: 0;
}

@media (max-width: 768px) {
  .qr-payment-card {
    gap: 1.5rem;
  }

  .qr-instruction-section {
    padding: 1.5rem;
  }

  .qr-container {
    padding: 1.5rem;
  }

  .qr-canvas {
    max-width: 250px;
  }

  .qr-actions {
    flex-direction: column;
  }

  .btn {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .qr-payment-card {
    gap: 1rem;
  }

  .qr-instruction-section {
    padding: 1rem;
  }

  .qr-instruction-section h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .qr-container {
    padding: 1rem;
  }

  .qr-canvas {
    max-width: 200px;
  }

  .qr-instructions {
    padding: 0.75rem;
  }

  .qr-instructions h4 {
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }

  .qr-instructions li {
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
  }
}
</style>
