<template>
  <div class="screening-card" @click="$emit('click')">
    <div class="cinema-header">
      <h4>{{ screening.cinema_name }}</h4>
      <span class="room-badge">Sala {{ screening.room_number }}</span>
    </div>

    <div class="screening-content">
      <div class="time">
        <span class="hour">{{ formatTime(screening.start_time) }}</span>
        <span class="format">{{ screening.format || '2D' }}</span>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="label">Asientos:</span>
          <span class="value">{{ screening.available_seats }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Precio:</span>
          <span class="value price">{{ screening.base_price || 8 }}$</span>
        </div>
      </div>
    </div>

    <button class="btn btn-primary btn-full" @click.stop>
      Comprar Entrada
    </button>
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns'

defineProps({
  screening: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const formatTime = (dateTimeString) => {
  try {
    const date = parseISO(dateTimeString)
    return format(date, 'HH:mm')
  } catch {
    return dateTimeString.split(' ')[1]
  }
}
</script>

<style scoped>
.screening-card {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.screening-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  border-color: var(--primary);
}

.cinema-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.cinema-header h4 {
  margin: 0;
  color: var(--primary);
  font-size: 1.05rem;
}

.room-badge {
  background: rgba(102, 126, 234, 0.2);
  color: var(--primary);
  padding: 0.25rem 0.6rem;
  border-radius: var(--border-radius-lg);
  font-size: 0.8rem;
  white-space: nowrap;
}

.screening-content {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #3d3d3d;
}

.time {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.hour {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
}

.format {
  font-size: 0.85rem;
  color: #999;
}

.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.label {
  color: #999;
}

.value {
  color: #ccc;
  font-weight: 600;
}

.price {
  color: var(--primary);
  font-size: 1.1rem;
}

.btn-full {
  width: 100%;
}
</style>
