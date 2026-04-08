<template>
  <div class="my-tickets-page">
    <div class="container">
      <h1>Mis Entradas</h1>

      <div v-if="!authStore.isAuthenticated" class="auth-required">
        <p>Debes iniciar sesión para ver tus entradas</p>
  <router-link to="/login" class="btn btn-primary">
          Iniciar Sesión
        </router-link>
      </div>

      <div v-else>
        <!-- Loading State -->
        <div v-if="loading" class="loading">
          Cargando tus entradas...
        </div>

        <!-- Tickets Grid -->
        <div v-else-if="tickets.length > 0" class="tickets-grid">
          <div 
            v-for="ticket in tickets" 
            :key="ticket.id"
            class="ticket-card"
          >
            <!-- Ticket Header -->
            <div class="ticket-header">
              <div class="ticket-status" :class="getStatusClass(ticket.status)">
                {{ getStatusLabel(ticket.status) }}
              </div>
              <span class="ticket-number">{{ ticket.ticket_number }}</span>
            </div>

            <!-- Movie Info -->
            <div class="ticket-movie">
              <img 
                :src="ticket.movie_poster || smallPlaceholder"
                :alt="ticket.movie_title"
                class="movie-poster"
              >
              <div class="movie-info">
                <h3>{{ ticket.movie_title }}</h3>
                <p class="genre">{{ ticket.genre }}</p>
              </div>
            </div>

            <!-- Screening Details -->
            <div class="ticket-details">
              <div class="detail-item">
                <span class="label">Cine:</span>
                <span>{{ ticket.cinema_name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Sala:</span>
                <span>{{ ticket.room_number }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Fecha:</span>
                <span>{{ formatDate(ticket.screening_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Hora:</span>
                <span>{{ formatTime(ticket.screening_time) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Asiento:</span>
                <span class="seat-number">{{ getTicketSeatLabel(ticket) }}</span>
              </div>
            </div>

            <!-- QR Code (Placeholder) -->
            <div class="qr-code">
              <div class="qr-placeholder">
                📱
              </div>
              <p>Presenta este código en la entrada</p>
            </div>

            <!-- Actions -->
            <div v-if="ticket.status === 'available'" class="ticket-actions">
              <button @click="downloadTicket(ticket)" class="btn btn-secondary">
                Descargar
              </button>
              <button @click="cancelTicket(ticket.id)" class="btn-danger">
                Cancelar
              </button>
            </div>

            <div v-else-if="ticket.status === 'cancelled'" class="cancelled-notice">
              Entrada cancelada
            </div>

            <div v-else-if="ticket.status === 'used'" class="used-notice">
              Entrada utilizada
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">🎫</div>
          <h2>No tienes entradas</h2>
          <p>Aún no has comprado ninguna entrada</p>
          <router-link to="/movies" class="btn btn-primary">
            Comprar Entradas
          </router-link>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showCancelConfirm" class="modal-overlay">
        <div class="modal">
          <h3>Confirmar Cancelación</h3>
          <p>¿Estás seguro de que deseas cancelar esta entrada?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button @click="confirmCancel" class="btn-danger">
              Sí, Cancelar
            </button>
            <button @click="showCancelConfirm = false" class="btn btn-secondary">
              No, Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ticketService } from '@/services/ticketService'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { smallPlaceholder } from '@/utils/placeholder'

const authStore = useAuthStore()

const tickets = ref([])
const loading = ref(false)
const showCancelConfirm = ref(false)
const ticketToCancel = ref(null)

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadTickets()
  }
})

const loadTickets = async () => {
  loading.value = true
  try {
    const ticketsData = await ticketService.getAll()
    tickets.value = Array.isArray(ticketsData) ? ticketsData : []
  } catch (error) {
    console.error('Error loading tickets:', error)
    tickets.value = []
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  return `status-${status}`
}

const getStatusLabel = (status) => {
  const labels = {
    available: 'Disponible',
    used: 'Utilizada',
    cancelled: 'Cancelada',
    pending: 'Pendiente'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  try {
    const date = parseISO(dateString)
    return format(date, "d 'de' MMMM", { locale: es })
  } catch {
    return dateString
  }
}

const formatTime = (timeString) => {
  try {
    const parts = timeString.split(':')
    return `${parts[0]}:${parts[1]}`
  } catch {
    return timeString
  }
}

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['1', 'true', 'yes', 'si', 'sí'].includes(normalized)
  }
  return false
}

const getTicketSeatLabel = (ticket) => {
  if (normalizeBoolean(ticket?.non_number)) return 'S/N'
  if (ticket?.seat_code) return String(ticket.seat_code)
  const row = ticket?.seat_row || ''
  const number = ticket?.seat_number || ''
  return `${row}${number}` || 'N/A'
}

const downloadTicket = (ticket) => {
  // In a real app, this would generate a PDF or download a file
  console.log('Downloading ticket:', ticket.ticket_number)
  alert(`Descargando entrada ${ticket.ticket_number}...`)
}

const cancelTicket = (ticketId) => {
  ticketToCancel.value = ticketId
  showCancelConfirm.value = true
}

const confirmCancel = async () => {
  try {
    await ticketService.cancelTicket(ticketToCancel.value)
    // Reload tickets
    await loadTickets()
    showCancelConfirm.value = false
    ticketToCancel.value = null
  } catch (error) {
    console.error('Error cancelling ticket:', error)
    alert('Error al cancelar la entrada')
  }
}
</script>

<style scoped>
.my-tickets-page {
  padding: 2rem 0;
  min-height: 600px;
}

.my-tickets-page h1 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
}

.auth-required {
  text-align: center;
  padding: 3rem 1rem;
  background: #2d2d2d;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
}

.auth-required p {
  color: #ccc;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: #2d2d2d;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #999;
  margin-bottom: 2rem;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.ticket-card {
  background: #2d2d2d;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #1a1a1a;
  border-bottom: 1px solid #3d3d3d;
}

.ticket-status {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.ticket-status.status-available {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.ticket-status.status-used {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.ticket-status.status-cancelled {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.ticket-number {
  color: var(--primary);
  font-weight: 700;
  font-size: 0.9rem;
  font-family: monospace;
}

.ticket-movie {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #3d3d3d;
}

.movie-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.movie-info {
  flex: 1;
}

.movie-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary);
}

.genre {
  color: #999;
  margin: 0;
  font-size: 0.9rem;
}

.ticket-details {
  padding: 1.5rem;
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.detail-item .label {
  color: var(--primary);
  font-weight: 600;
}

.detail-item span:last-child {
  color: #ccc;
}

.seat-number {
  background: rgba(102, 126, 234, 0.2);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
}

.qr-code {
  text-align: center;
  padding: 1.5rem;
  background: #1a1a1a;
  border-top: 1px solid #3d3d3d;
  border-bottom: 1px solid #3d3d3d;
}

.qr-placeholder {
  width: 100px;
  height: 100px;
  background: #2d2d2d;
  border: 2px solid #3d3d3d;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  font-size: 2.5rem;
}

.qr-code p {
  color: #999;
  margin: 0;
  font-size: 0.85rem;
}

.ticket-actions,
.cancelled-notice,
.used-notice {
  padding: 1rem;
  border-top: 1px solid #3d3d3d;
}

.ticket-actions {
  display: flex;
  gap: 0.5rem;
}

.ticket-actions button {
  flex: 1;
}

.cancelled-notice,
.used-notice {
  text-align: center;
  color: #999;
  font-size: 0.95rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  color: var(--primary);
  margin-top: 0;
  margin-bottom: 1rem;
}

.modal p {
  color: #ccc;
  margin: 0.75rem 0;
}

.modal .warning {
  color: #ff6b6b;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  flex: 1;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 1.1rem;
}

.btn-danger {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-danger:hover {
  background: #d32f2f;
}

@media (max-width: 768px) {
  .my-tickets-page {
    padding: 1.5rem 0;
  }

  .my-tickets-page h1 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .filter-section {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .filter-select {
    padding: 0.7rem;
    font-size: 0.95rem;
  }

  .tickets-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }

  .ticket-card {
    padding: 1.25rem;
  }

  .ticket-header {
    margin-bottom: 1rem;
  }

  .ticket-header h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .ticket-date {
    font-size: 0.85rem;
  }

  .ticket-details {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    font-size: 0.8rem;
  }

  .detail-value {
    font-size: 0.95rem;
  }

  .seats-list {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .seat-tag {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .ticket-actions {
    gap: 0.5rem;
  }

  .ticket-actions button {
    flex: 1;
    padding: 0.65rem;
    font-size: 0.85rem;
  }

  .modal {
    width: 95%;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .modal-body {
    gap: 1rem;
  }

  .qr-section {
    padding: 1rem;
  }

  .qr-code {
    max-width: 250px;
  }

  .ticket-info {
    gap: 0.5rem;
  }

  .info-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    font-size: 0.8rem;
  }

  .info-value {
    font-size: 0.95rem;
  }

  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-actions button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .no-tickets {
    padding: 2rem 1rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .my-tickets-page {
    padding: 1rem 0;
  }

  .my-tickets-page h1 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .filter-section {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .filter-select {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .tickets-grid {
    gap: 0.8rem;
  }

  .ticket-card {
    padding: 1rem;
    border-radius: 6px;
  }

  .ticket-header {
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .ticket-header h3 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .ticket-date {
    font-size: 0.75rem;
  }

  .ticket-details {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .detail-item {
    flex-direction: row;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .detail-label {
    font-size: 0.7rem;
    min-width: 60px;
  }

  .detail-value {
    font-size: 0.8rem;
    text-align: right;
  }

  .seats-list {
    gap: 0.35rem;
    margin-bottom: 0.75rem;
  }

  .seat-tag {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }

  .ticket-actions {
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .ticket-actions button {
    flex: 1;
    min-width: 80px;
    padding: 0.55rem;
    font-size: 0.75rem;
  }

  .btn-danger {
    min-width: 60px;
  }

  .modal {
    width: 98%;
    max-height: 90vh;
    padding: 1.25rem;
    border-radius: 6px;
    overflow-y: auto;
  }

  .modal-header {
    margin-bottom: 0.75rem;
  }

  .modal-header h2 {
    font-size: 1.1rem;
  }

  .modal-close {
    width: 28px;
    height: 28px;
    font-size: 1.2rem;
  }

  .modal-body {
    gap: 0.75rem;
  }

  .qr-section {
    padding: 0.75rem;
    border-radius: 6px;
  }

  .qr-code {
    max-width: 200px;
  }

  .ticket-info {
    gap: 0.35rem;
  }

  .info-row {
    flex-direction: column;
    gap: 0.15rem;
  }

  .info-label {
    font-size: 0.7rem;
  }

  .info-value {
    font-size: 0.8rem;
    word-break: break-word;
  }

  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-actions button {
    width: 100%;
    padding: 0.65rem;
    font-size: 0.85rem;
  }

  .no-tickets {
    padding: 1.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
