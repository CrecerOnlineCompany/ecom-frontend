<template>
  <div class="confirmation-page">
    <div class="container">
      <div class="confirmation-card">
        <div class="success-icon">✓</div>

        <h1>¡Compra Exitosa!</h1>

        <p class="success-message">
          Tus entradas han sido reservadas correctamente.
        </p>

        <!-- Ticket Numbers -->
        <div class="ticket-info">
          <h2>Números de Entrada:</h2>
          <div class="ticket-list">
            <div v-for="ticketNumber in ticketNumbers" :key="ticketNumber" class="ticket-number">
              {{ ticketNumber }}
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3>Próximos Pasos:</h3>
          <ol>
            <li>Recibirás un email de confirmación con tus entradas</li>
            <li>Muestra tu código en la entrada del cine</li>
            <li>Puedes descargar o imprimir tus entradas desde "Mis Entradas"</li>
            <li>Llega 15 minutos antes de que comience la función</li>
          </ol>
        </div>

        <!-- Actions -->
        <div class="action-buttons">
          <router-link to="/my-tickets" class="btn btn-primary">
            Ver Mis Entradas
          </router-link>
          <router-link to="/" class="btn btn-secondary">
            Volver al Inicio
          </router-link>
        </div>

        <!-- Contact Info -->
        <div class="contact-info">
          <p>¿Necesitas ayuda?</p>
          <p>Contacta con nosotros en <strong>info@cinea.es</strong> o llamanos al <strong>+34 91 123 4567</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const ticketNumbers = computed(() => {
  const param = route.params.ticketNumbers
  if (param) {
    return param.split(',')
  }
  return []
})

onMounted(() => {
  // If no ticket numbers, redirect to home
  if (ticketNumbers.value.length === 0) {
    router.push('/')
  }
})
</script>

<style scoped>
.confirmation-page {
  padding: 2rem 0;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 3rem 2rem;
  max-width: 600px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 3rem;
  color: white;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.confirmation-card h1 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 2rem;
}

.ticket-info {
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  margin-bottom: 2rem;
}

.ticket-info h2 {
  color: var(--primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.ticket-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.ticket-number {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--primary);
  font-family: monospace;
  word-break: break-all;
}

.next-steps {
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  margin-bottom: 2rem;
  text-align: left;
}

.next-steps h3 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.next-steps ol {
  color: #ccc;
  margin: 0;
  padding-left: 1.5rem;
}

.next-steps li {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.action-buttons a {
  flex: 1;
  min-width: 150px;
}

.contact-info {
  color: #999;
  font-size: 0.95rem;
}

.contact-info p {
  margin: 0.5rem 0;
}

.contact-info strong {
  color: var(--primary);
}

@media (max-width: 768px) {
  .confirmation-page {
    padding: 1.5rem 0;
  }

  .confirmation-card {
    padding: 1.5rem;
    margin: 1rem;
    border-radius: 8px;
  }

  .confirmation-card h1 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .confirmation-message {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .confirmation-number {
    font-size: 1.1rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .ticket-list {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .ticket-item {
    padding: 1rem;
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
    font-size: 0.85rem;
  }

  .ticket-details {
    gap: 0.5rem;
  }

  .ticket-detail {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    font-size: 0.8rem;
  }

  .detail-value {
    font-size: 0.9rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .action-buttons a,
  .action-buttons button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .contact-info {
    padding: 1rem;
    font-size: 0.9rem;
  }

  .contact-info p {
    margin: 0.35rem 0;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .confirmation-page {
    padding: 1rem 0;
  }

  .confirmation-card {
    padding: 1.25rem;
    margin: 0.5rem;
  }

  .confirmation-card h1 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }

  .success-icon {
    width: 50px;
    height: 50px;
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
  }

  .confirmation-message {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .confirmation-number {
    font-size: 0.95rem;
    padding: 0.6rem;
    margin-bottom: 0.75rem;
    word-break: break-all;
  }

  .ticket-list {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .ticket-item {
    padding: 0.75rem;
    border-radius: 6px;
  }

  .ticket-header {
    margin-bottom: 0.6rem;
    padding-bottom: 0.6rem;
  }

  .ticket-header h3 {
    font-size: 0.9rem;
    margin-bottom: 0.15rem;
  }

  .ticket-date {
    font-size: 0.75rem;
  }

  .ticket-details {
    gap: 0.35rem;
  }

  .ticket-detail {
    flex-direction: column;
    gap: 0.15rem;
  }

  .detail-label {
    font-size: 0.7rem;
  }

  .detail-value {
    font-size: 0.8rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .action-buttons a,
  .action-buttons button {
    width: 100%;
    padding: 0.65rem;
    font-size: 0.85rem;
  }

  .contact-info {
    padding: 0.75rem;
    font-size: 0.8rem;
  }

  .contact-info p {
    margin: 0.25rem 0;
    font-size: 0.75rem;
  }

  .contact-info strong {
    font-size: 0.75rem;
  }
}
</style>
