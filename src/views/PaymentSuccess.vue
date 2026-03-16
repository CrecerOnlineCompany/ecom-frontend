<template>
  <div class="payment-success-page">
    <div class="container">
      <div class="success-card">
        <!-- Header with success animation -->
        <div class="success-header">
          <div class="success-icon-large icon-success"></div>
          <h1>¡Pago Exitoso!</h1>
          <p class="success-subtitle">Tu compra ha sido procesada correctamente</p>
        </div>

        <p v-if="isLoadingData" class="loading-message">Cargando información de la compra...</p>
        <p v-else-if="loadError" class="loading-error">{{ loadError }}</p>
        <div v-if="requiresDeskAssistance" class="desk-assistance">
          <h3>Atención en ventanilla requerida</h3>
          <p>No pudimos validar todos los datos del pago en línea.</p>
          <p><strong>Orden:</strong> {{ orderNumberDisplay }}</p>
          <p>Acércate a ventanilla con este número para finalizar la entrega de entradas.</p>
        </div>

        <!-- Ticket Information -->
        <div class="ticket-display" v-if="hasTickets && !requiresDeskAssistance">
          <div class="ticket-section">
            <h3>Datos de la Orden</h3>
            <div class="info-grid order-grid">
              <div class="info-item">
                <span class="info-label">Película:</span>
                <span class="info-value">{{ orderData?.movieTitle || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Cine:</span>
                <span class="info-value">{{ orderData?.cinemaName || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Sala:</span>
                <span class="info-value">{{ orderData?.roomName || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Formato:</span>
                <span class="info-value">{{ orderData?.format || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha:</span>
                <span class="info-value">{{ orderData?.screeningDate || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hora:</span>
                <span class="info-value">{{ orderData?.screeningTime || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Entradas:</span>
                <span class="info-value">{{ ticketsCountDisplay }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total:</span>
                <span class="info-value">{{ amountDisplay }} {{ currencyDisplay }}</span>
              </div>
            </div>
          </div>

          <div class="ticket-list-section">
            <h3>Entradas</h3>
            <div class="tickets-list">
              <div v-for="ticket in ticketsData" :key="ticket.ticketNumber" class="ticket-item">
                <div class="ticket-row">
                  <span class="info-label">Número:</span>
                  <span class="info-value code">{{ ticket.ticketNumber }}</span>
                </div>
                <div class="ticket-row">
                  <span class="info-label">Asiento(s):</span>
                  <span class="info-value">{{ ticket.seatNumber }}</span>
                </div>
                <div class="ticket-row">
                  <span class="info-label">Precio:</span>
                  <span class="info-value">{{ ticket.price }} {{ currencyDisplay }}</span>
                </div>
                <div class="ticket-row">
                  <span class="info-label">Estado:</span>
                  <span class="info-value">{{ ticket.statusText }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detalles de Compra -->
        <div class="purchase-details">
          <h3>Detalles de la Compra</h3>
          <div class="detail-row">
            <span>Número de Orden:</span>
            <span class="code">{{ orderNumberDisplay }}</span>
          </div>
          <div class="detail-row">
            <span>Código de Compra:</span>
            <span class="code">{{ orderNumberDisplay }}</span>
          </div>
          <div class="detail-row">
            <span>Fecha de Compra:</span>
            <span>{{ purchaseDate }}</span>
          </div>
          <div class="detail-row">
            <span>Importe Pagado:</span>
            <span class="amount">{{ amountDisplay }} {{ currencyDisplay }}</span>
          </div>
          <div class="detail-row">
            <span>Estado:</span>
            <span class="status-badge status-success">{{ paymentStatusDisplay }}</span>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3>Próximos Pasos</h3>
          <ol>
            <li>Recuerda tu número de orden: <strong>{{ orderNumberDisplay }}</strong></li>
            <li>Recibirás un email de confirmación con tu comprobante</li>
            <li>Puedes imprimir tu entrada desde el botón de abajo</li>
            <li>Presenta tu entrada en la taquilla del cine</li>
            <li>Llega 15 minutos antes de que comience la función</li>
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            @click="handlePrint" 
            class="btn btn-primary btn-large"
            :disabled="isPrinting || requiresDeskAssistance || !hasTickets"
          >
            <span v-if="!isPrinting">{{ printButtonLabel }}</span>
            <span v-else>Imprimiendo...</span>
          </button>
          <button 
            @click="downloadTicket" 
            class="btn btn-secondary btn-large"
            :disabled="requiresDeskAssistance || !hasTickets"
          >
            {{ downloadButtonLabel }}
          </button>
          <router-link to="/" class="btn btn-tertiary btn-large">
            Volver al Inicio
          </router-link>
        </div>
        <p v-if="printMessage" :class="['print-message', printMessageType]">{{ printMessage }}</p>

        <!-- Contact Info -->
        <div class="contact-section">
          <h4>¿Necesitas ayuda?</h4>
          <p>Contacta con nosotros en <strong>info@cinea.es</strong></p>
          <p>Teléfono: <strong>+34 91 123 4567</strong></p>
          <p class="hours">Lun-Dom: 10:00 - 22:00</p>
        </div>
      </div>
    </div>

    <!-- Print Hidden Frame -->
    <div id="print-frame" style="display: none;"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { printService } from '@/services/printService'
import { paymentService } from '@/services/paymentService'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const cartStore = useCartStore()

const ticketParam = ref('')
const orderParam = ref('')
const ticketData = ref(null)
const ticketsData = ref([])
const isPrinting = ref(false)
const isLoadingData = ref(false)
const loadError = ref('')
const printMessage = ref('')
const printMessageType = ref('info')
const orderData = ref(null)
const paymentData = ref(null)
const requiresDeskAssistance = ref(false)

const formatDateFromIso = (isoDate) => {
  if (!isoDate) return 'N/A'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('es-AR')
}

const formatTimeFromIso = (isoDate) => {
  if (!isoDate) return 'N/A'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const normalizeTicket = (rawTicket, order) => {
  const details = Array.isArray(rawTicket?.details) ? rawTicket.details : []
  const seatCodes = details
    .map((detail) => detail?.seat_code || `F${detail?.row_number || ''}-S${detail?.seat_number || ''}`)
    .filter(Boolean)
  const statusRaw = String(rawTicket?.status || '').toLowerCase()
  const statusText = statusRaw === 'confirmed'
    ? 'Confirmado'
    : statusRaw === 'pending'
      ? 'Pendiente'
      : statusRaw === 'cancelled'
        ? 'Cancelado'
        : 'Pendiente'

  return {
    ticketNumber: String(rawTicket?.ticket_number || rawTicket?.id || 'N/A'),
    movieTitle: String(order?.screening?.movie?.title || 'Película'),
    screeningDate: formatDateFromIso(order?.screening?.start_time),
    screeningTime: formatTimeFromIso(order?.screening?.start_time),
    seatNumber: seatCodes.length ? seatCodes.join(', ') : 'N/A',
    price: String(rawTicket?.price || '0.00'),
    statusText
  }
}

const normalizePaymentStatusText = (statusRaw) => {
  const status = String(statusRaw || '').toLowerCase()
  if (status === 'completed' || status === 'approved') return 'Completado'
  if (status === 'processing' || status === 'pending') return 'Procesando'
  if (status === 'rejected' || status === 'declined') return 'Rechazado'
  return 'Completado'
}

const purchaseDate = computed(() => {
  const raw = paymentData.value?.paidAt || paymentData.value?.updatedAt
  const date = raw ? new Date(raw) : new Date()
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const orderNumberDisplay = computed(() => {
  return orderData.value?.orderNumber || orderParam.value || 'N/A'
})

const amountDisplay = computed(() => {
  const amount = Number(paymentData.value?.amount ?? orderData.value?.totalAmount)
  return Number.isFinite(amount) ? amount.toFixed(2) : 'No disponible'
})

const hasTickets = computed(() => {
  return ticketsData.value.length > 0 || !!ticketData.value
})

const ticketsCountDisplay = computed(() => {
  const count = ticketsData.value.length || (ticketData.value ? 1 : 0)
  return String(count)
})

const printButtonLabel = computed(() => {
  return (ticketsData.value.length > 1 ? 'Imprimir Entradas' : 'Imprimir Entrada')
})

const downloadButtonLabel = computed(() => {
  return (ticketsData.value.length > 1 ? 'Descargar Entradas' : 'Descargar Entrada')
})

const currencyDisplay = computed(() => {
  return paymentData.value?.currency || orderData.value?.currency || 'ARS'
})

const paymentStatusDisplay = computed(() => {
  return normalizePaymentStatusText(paymentData.value?.status)
})

const normalizeOrderNumber = (value) => {
  return String(value || '').trim()
}

const clearCartIfMatchingOrder = (resolvedOrderNumber) => {
  const sessionOrder = normalizeOrderNumber(cartStore.currentSession?.order_number)
  const successOrder = normalizeOrderNumber(
    resolvedOrderNumber || orderParam.value || orderData.value?.orderNumber
  )

  if (!sessionOrder || !successOrder) return
  if (sessionOrder !== successOrder) return

  cartStore.clearCart()
  cartStore.clearPaymentSession()
}

onMounted(async () => {
  // Obtén el número de ticket de los parámetros
  ticketParam.value = route.query.ticket || route.params.ticket || 'N/A'
  orderParam.value = route.query.order || route.params.order || ''
  orderData.value = {
    orderNumber: String(orderParam.value || 'N/A'),
    currency: 'ARS',
    movieTitle: '',
    cinemaName: '',
    roomName: '',
    format: '',
    screeningDate: '',
    screeningTime: ''
  }

  // Si no hay número de orden no podemos consultar detalles
  if (!orderParam.value) {
    requiresDeskAssistance.value = true
    loadError.value = 'Falta el número de orden en la URL. Continúa en ventanilla.'
    return
  }

  // Intenta obtener datos del ticket
  await loadTicketData()
  clearCartIfMatchingOrder(orderData.value?.orderNumber)

  // Auto-scroll hacia el top
  window.scrollTo(0, 0)
})

const persistTickets = (tickets = []) => {
  if (!tickets.length) return
  try {
    const storedTickets = localStorage.getItem('tickets')
    const existing = storedTickets ? JSON.parse(storedTickets) : []
    const byId = new Map(existing.map(t => [t.ticketNumber, t]))
    for (const ticket of tickets) {
      if (ticket?.ticketNumber) {
        byId.set(ticket.ticketNumber, ticket)
      }
    }
    localStorage.setItem('tickets', JSON.stringify(Array.from(byId.values())))
  } catch (err) {
    console.warn('No se pudo persistir tickets en localStorage:', err)
  }
}

const attemptAutoPrint = async () => {
  if (!ticketsData.value.length && !ticketData.value) return

  const printableTickets = ticketsData.value.length ? ticketsData.value : [ticketData.value]
  let success = false

  if (printableTickets.length > 1) {
    success = await printService.printMultipleTickets(printableTickets)
  } else {
    success = await printService.printThermalTicket(printableTickets[0])
  }

  if (success) {
    printMessageType.value = 'success'
    printMessage.value = 'Impresión automática iniciada.'
  } else {
    printMessageType.value = 'error'
    printMessage.value = 'No se pudo imprimir automáticamente. Usa el botón "Imprimir Entrada".'
  }
}

const loadTicketData = async () => {
  isLoadingData.value = true
  loadError.value = ''
  requiresDeskAssistance.value = false

  try {
    const detailsResponse = await paymentService.getPaymentOrderDetails(orderParam.value)
    const response = detailsResponse || {}

    if (!response.success || !response.order) {
      throw new Error('Respuesta inválida del endpoint de detalle de orden')
    }

    const rawOrder = response.order
    const rawTickets = Array.isArray(response.tickets) ? response.tickets : []
    const rawPayments = Array.isArray(response.payments) ? response.payments : []

    const latestPayment = rawPayments[0] || {}
    const amountNumber = Number(rawOrder.total_amount ?? latestPayment?.response_data?.amount)
    if (!Number.isFinite(amountNumber)) {
      throw new Error('Monto no disponible desde backend')
    }

    orderData.value = {
      orderNumber: String(rawOrder.order_number || orderParam.value),
      currency: String(rawOrder.currency || 'ARS'),
      totalAmount: amountNumber,
      movieTitle: String(rawOrder.screening?.movie?.title || 'N/A'),
      cinemaName: String(rawOrder.screening?.room?.cinema?.name || 'N/A'),
      roomName: String(rawOrder.screening?.room?.name || 'N/A'),
      format: String(rawOrder.screening?.format || 'N/A'),
      screeningDate: formatDateFromIso(rawOrder.screening?.start_time),
      screeningTime: formatTimeFromIso(rawOrder.screening?.start_time)
    }

    paymentData.value = {
      amount: amountNumber,
      status: latestPayment.status || rawOrder.status || 'completed',
      paidAt: rawOrder.paid_at || latestPayment.completed_at || null,
      updatedAt: latestPayment.updated_at || rawOrder.updated_at || null,
      currency: String(rawOrder.currency || 'ARS')
    }

    if (rawTickets.length === 0) {
      requiresDeskAssistance.value = true
      loadError.value = 'Pago confirmado, pero las entradas aún no están disponibles. Continúa en ventanilla con tu número de orden.'
      ticketData.value = null
      ticketsData.value = []
      printMessageType.value = 'error'
      printMessage.value = 'Impresión deshabilitada: ve a ventanilla con tu número de orden.'
      return
    }

    const normalizedTickets = rawTickets.map(ticket => normalizeTicket(ticket, rawOrder))
    ticketsData.value = normalizedTickets
    ticketData.value = normalizedTickets[0]

    persistTickets(normalizedTickets)
    await attemptAutoPrint()
  } catch (e) {
    console.error('Error al cargar datos del ticket:', e)
    loadError.value = 'Faltan datos del pago o el backend no respondió. Continúa en ventanilla.'
    requiresDeskAssistance.value = true
    ticketData.value = null
    ticketsData.value = []
    paymentData.value = null
    printMessageType.value = 'error'
    printMessage.value = 'Impresión deshabilitada: ve a ventanilla con tu número de orden.'
  } finally {
    isLoadingData.value = false
  }
}

const handlePrint = async () => {
  if (requiresDeskAssistance.value) {
    printMessageType.value = 'error'
    printMessage.value = 'Impresión deshabilitada: ve a ventanilla con tu número de orden.'
    return
  }

  isPrinting.value = true
  try {
    const printableTickets = ticketsData.value.length ? ticketsData.value : [ticketData.value]
    const success = printableTickets.length > 1
      ? await printService.printMultipleTickets(printableTickets)
      : await printService.printThermalTicket(printableTickets[0])

    if (success) {
      printMessageType.value = 'success'
      printMessage.value = 'Impresión iniciada correctamente.'
    } else {
      printMessageType.value = 'error'
      printMessage.value = 'No se pudo completar la impresión. Verifica tu impresora.'
    }
  } catch (error) {
    console.error('Error durante la impresión:', error)
    printMessageType.value = 'error'
    printMessage.value = 'Error al intentar imprimir. Intenta de nuevo.'
  } finally {
    isPrinting.value = false
  }
}

const downloadTicket = () => {
  if (!hasTickets.value || requiresDeskAssistance.value) return
  const printableTickets = ticketsData.value.length ? ticketsData.value : [ticketData.value]
  const rowsHtml = printableTickets
    .map((ticket) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${ticket.ticketNumber}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${ticket.seatNumber}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${ticket.price} ${currencyDisplay.value}</td>
      </tr>
    `)
    .join('')

  // Función placeholder para descargar el ticket como PDF
  const html = `
    <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
      <h1>CINEA - Entradas</h1>
      <p><strong>${orderData.value?.movieTitle || ticketData.value?.movieTitle || 'Película'}</strong></p>
      <p>Número de orden: ${orderNumberDisplay.value}</p>
      <p>Fecha: ${orderData.value?.screeningDate || ticketData.value?.screeningDate || 'N/A'}</p>
      <p>Hora: ${orderData.value?.screeningTime || ticketData.value?.screeningTime || 'N/A'}</p>
      <table style="margin: 16px auto; border-collapse: collapse; min-width: 420px;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd;">Ticket</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Asiento(s)</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `entrada_${orderNumberDisplay.value}.html`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  padding: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 700px;
  width: 100%;
  padding: 0 1rem;
}

.success-card {
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem 2rem;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-header {
  text-align: center;
  margin-bottom: 2rem;
}

.success-icon-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
  animation: bounce 0.6s ease-out;
  position: relative;
}

.success-icon-large.icon-success::before {
  content: '';
  width: 35px;
  height: 18px;
  border: 3px solid white;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
  position: relative;
  left: -5px;
}

.success-icon-large.icon-success::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 3px;
  background: white;
  top: 50%;
  right: 20px;
  transform: translateY(-50%) rotate(-45deg);
}

@keyframes bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

h1 {
  color: var(--primary, #667eea);
  font-size: 2.5rem;
  margin: 0;
  margin-bottom: 0.5rem;
}

.success-subtitle {
  color: #e0e0e0;
  font-size: 1.1rem;
  margin: 0;
}

.ticket-display {
  background: rgba(102, 126, 234, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--primary, #667eea);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.ticket-section h3 {
  color: var(--primary, #667eea);
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
}

.ticket-list-section {
  margin-top: 1.5rem;
}

.ticket-list-section h3 {
  color: var(--primary, #667eea);
  font-size: 1.05rem;
  margin-top: 0;
  margin-bottom: 0.8rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  color: #999;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  color: #e0e0e0;
  font-size: 0.95rem;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ticket-item {
  padding: 0.9rem;
  border: 1px solid rgba(102, 126, 234, 0.25);
  border-radius: 8px;
  background: rgba(45, 45, 45, 0.45);
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.35rem;
}

.ticket-row:last-child {
  margin-bottom: 0;
}

.info-value.code {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--primary, #667eea);
}

.purchase-details {
  background: rgba(45, 45, 45, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.purchase-details h3 {
  color: var(--primary, #667eea);
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  color: #e0e0e0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span:first-child {
  font-weight: 600;
}

.detail-row .code {
  font-family: 'Courier New', monospace;
  color: var(--primary, #667eea);
  font-weight: bold;
}

.detail-row .amount {
  color: #27ae60;
  font-weight: bold;
  font-size: 1.1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-success {
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.next-steps {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--primary, #667eea);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.next-steps h3 {
  color: var(--primary, #667eea);
  margin-top: 0;
  margin-bottom: 1rem;
}

.next-steps ol {
  margin: 0;
  padding-left: 1.5rem;
  color: #e0e0e0;
}

.next-steps li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
}

.btn-large {
  font-size: 1.05rem;
  padding: 1.2rem 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: var(--primary, #667eea);
  border: 2px solid var(--primary, #667eea);
}

.btn-secondary:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: var(--primary, #667eea);
}

.btn-tertiary {
  background: transparent;
  color: var(--primary, #667eea);
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.btn-tertiary:hover {
  border-color: var(--primary, #667eea);
}

.contact-section {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  color: #ccc;
}

.contact-section h4 {
  color: var(--primary, #667eea);
  margin-bottom: 0.5rem;
}

.contact-section p {
  margin: 0.3rem 0;
}

.contact-section .hours {
  font-size: 0.9rem;
  color: #999;
}

.loading-message,
.loading-error,
.print-message {
  text-align: center;
  margin-bottom: 1rem;
}

.loading-message {
  color: #e0e0e0;
}

.loading-error,
.print-message.error {
  color: #fca5a5;
}

.print-message.success {
  color: #86efac;
}

.desk-assistance {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.45);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #fecaca;
}

.desk-assistance h3 {
  margin: 0 0 0.5rem 0;
  color: #fca5a5;
}

.desk-assistance p {
  margin: 0.35rem 0;
}

/* Responsive */
@media (max-width: 600px) {
  .success-card {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .success-icon-large {
    width: 80px;
    height: 80px;
    font-size: 40px;
  }

  .action-buttons {
    gap: 0.75rem;
  }

  .btn {
    padding: 0.9rem 1.2rem;
  }
}
</style>
