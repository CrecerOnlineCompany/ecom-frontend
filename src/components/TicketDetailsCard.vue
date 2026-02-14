<template>
  <div class="ticket-card" v-if="ticket">
    <div class="card-header">
      <h2>{{ ticket.movie_title }}</h2>
      <span class="ticket-number">{{ ticket.ticket_number }}</span>
    </div>

    <div class="card-content">
      <div class="info-section">
        <h3>Información de la Función</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Cine:</label>
            <span>{{ ticket.cinema }}</span>
          </div>
          <div class="info-item">
            <label>Sala:</label>
            <span>{{ ticket.room }}</span>
          </div>
          <div class="info-item">
            <label>Fecha:</label>
            <span>{{ formatDate(ticket.screening_date) }}</span>
          </div>
          <div class="info-item">
            <label>Hora:</label>
            <span>{{ ticket.screening_time }}</span>
          </div>
        </div>
      </div>

      <div class="seats-section">
        <h3>Asientos Reservados</h3>
        <div class="seats-list">
          <div v-for="seat in ticket.seats" :key="seat.id" class="seat-item">
            <span class="seat-code">{{ seat.seat_code }}</span>
            <span class="seat-price">${{ seat.price }}</span>
            <span class="seat-status" :class="seat.status">{{ seat.status }}</span>
          </div>
        </div>
      </div>

      <div class="customer-section">
        <h3>Datos del Cliente</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Nombre:</label>
            <span>{{ ticket.customer_name }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ ticket.customer_email }}</span>
          </div>
          <div class="info-item" v-if="ticket.customer_phone">
            <label>Teléfono:</label>
            <span>{{ ticket.customer_phone }}</span>
          </div>
        </div>
      </div>

      <div class="totals-section">
        <div class="total-row">
          <span>Total a Pagar:</span>
          <strong>${{ ticket.total_price }}</strong>
        </div>
        <div class="total-row">
          <span>Comprado:</span>
          <span>{{ formatDateTime(ticket.purchased_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ticket: {
    type: Object,
    required: false,
    default: null
  }
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.ticket-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin: 2rem 0;
}

.card-header {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.ticket-number {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.card-content {
  padding: 2rem;
  color: white;
}

.info-section, .seats-section, .customer-section {
  margin-bottom: 2rem;
}

.info-section h3, .seats-section h3, .customer-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.info-item span {
  font-weight: 500;
}

.seats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.seat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  min-width: 80px;
  text-align: center;
}

.seat-code {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.seat-price {
  font-size: 0.9rem;
  opacity: 0.9;
}

.seat-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  margin-top: 0.25rem;
}

.seat-status.pending_payment {
  background: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.seat-status.confirmed {
  background: rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

.totals-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.total-row strong {
  font-size: 1.3rem;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-content {
    padding: 1rem;
  }
}
</style>
