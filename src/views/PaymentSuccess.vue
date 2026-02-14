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

        <!-- Ticket Information -->
        <div class="ticket-display" v-if="ticketData">
          <div class="ticket-section">
            <h3>Información de la Entrada</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Número de Entrada:</span>
                <span class="info-value code">{{ ticketData.ticketNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Película:</span>
                <span class="info-value">{{ ticketData.movieTitle }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha:</span>
                <span class="info-value">{{ ticketData.screeningDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hora:</span>
                <span class="info-value">{{ ticketData.screeningTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Asiento:</span>
                <span class="info-value">{{ ticketData.seatNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Precio:</span>
                <span class="info-value">{{ ticketData.price }} €</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Detalles de Compra -->
        <div class="purchase-details">
          <h3>Detalles de la Compra</h3>
          <div class="detail-row">
            <span>Número de Entrada:</span>
            <span class="code">{{ ticketParam }}</span>
          </div>
          <div class="detail-row">
            <span>Fecha de Compra:</span>
            <span>{{ purchaseDate }}</span>
          </div>
          <div class="detail-row">
            <span>Importe Pagado:</span>
            <span class="amount">{{ ticketData?.price || '10.00' }} €</span>
          </div>
          <div class="detail-row">
            <span>Estado:</span>
            <span class="status-badge status-success">Completado</span>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3>Próximos Pasos</h3>
          <ol>
            <li>Recuerda tu número de entrada: <strong>{{ ticketParam }}</strong></li>
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
            :disabled="isPrinting"
          >
            <span v-if="!isPrinting">Imprimir Entrada</span>
            <span v-else>Imprimiendo...</span>
          </button>
          <button 
            @click="downloadTicket" 
            class="btn btn-secondary btn-large"
          >
            Descargar Entrada
          </button>
          <router-link to="/" class="btn btn-tertiary btn-large">
            Volver al Inicio
          </router-link>
        </div>

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
import { useRouter, useRoute } from 'vue-router'
import { printService } from '@/services/printService'

const router = useRouter()
const route = useRoute()

const ticketParam = ref('')
const ticketData = ref(null)
const isPrinting = ref(false)

const purchaseDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

onMounted(() => {
  // Obtén el número de ticket de los parámetros
  ticketParam.value = route.query.ticket || route.params.ticket || 'N/A'

  // Si no hay ticket, redirige
  if (!ticketParam.value || ticketParam.value === 'N/A') {
    router.push('/')
    return
  }

  // Intenta obtener datos del ticket
  loadTicketData()

  // Auto-scroll hacia el top
  window.scrollTo(0, 0)
})

const loadTicketData = () => {
  try {
    // Intenta obtener los datos del localStorage
    const storedTickets = localStorage.getItem('tickets')
    if (storedTickets) {
      const tickets = JSON.parse(storedTickets)
      const ticket = tickets.find(t => t.ticketNumber === ticketParam.value)
      if (ticket) {
        ticketData.value = ticket
        return
      }
    }

    // Usa datos de ejemplo si no encuentra nada
    ticketData.value = {
      ticketNumber: ticketParam.value,
      movieTitle: 'Película Seleccionada',
      screeningDate: new Date().toLocaleDateString('es-ES'),
      screeningTime: '20:00',
      seatNumber: 'A1',
      price: '10.00'
    }
  } catch (e) {
    console.error('Error al cargar datos del ticket:', e)
    ticketData.value = {
      ticketNumber: ticketParam.value,
      movieTitle: 'N/A',
      screeningDate: 'N/A',
      screeningTime: 'N/A',
      seatNumber: 'N/A',
      price: '10.00'
    }
  }
}

const handlePrint = async () => {
  isPrinting.value = true
  try {
    const success = await printService.printThermalTicket({
      ticketNumber: ticketParam.value,
      movieTitle: ticketData.value?.movieTitle || 'Película',
      screeningDate: ticketData.value?.screeningDate || 'N/A',
      screeningTime: ticketData.value?.screeningTime || 'N/A',
      seatNumber: ticketData.value?.seatNumber || 'N/A',
      price: ticketData.value?.price || '10.00'
    })

    if (success) {
      console.log('Impresión iniciada correctamente')
    } else {
      alert('No se pudo completar la impresión. Verifica tu impresora térmica.')
    }
  } catch (error) {
    console.error('Error durante la impresión:', error)
    alert('Error al intentar imprimir. Intenta de nuevo.')
  } finally {
    isPrinting.value = false
  }
}

const downloadTicket = () => {
  // Función placeholder para descargar el ticket como PDF
  const html = `
    <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
      <h1>CINEA - Entrada</h1>
      <p><strong>${ticketData.value?.movieTitle || 'Película'}</strong></p>
      <p>Número: ${ticketParam.value}</p>
      <p>Fecha: ${ticketData.value?.screeningDate || 'N/A'}</p>
      <p>Hora: ${ticketData.value?.screeningTime || 'N/A'}</p>
      <p>Asiento: ${ticketData.value?.seatNumber || 'N/A'}</p>
    </div>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `entrada_${ticketParam.value}.html`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
