<template>
  <div class="payment-failed-page">
    <div class="container">
      <div class="failed-card">
        <!-- Header with failed animation -->
        <div class="failed-header">
          <div class="failed-icon-large icon-error"></div>
          <h1>¡Pago No Completado!</h1>
          <p class="failed-subtitle">Hubo un problema al procesar tu pago</p>
        </div>

        <!-- Error Details -->
        <div class="error-details">
          <h3>¿Qué pasó?</h3>
          <p class="error-message">
            {{ errorMessage }}
          </p>
          <div class="error-code">
            <span class="label">Código de referencia:</span>
            <span class="code">{{ ticketParam }}</span>
          </div>
        </div>

        <!-- Possible Reasons -->
        <div class="reasons-section">
          <h3>Posibles Causas:</h3>
          <ul class="reasons-list">
            <li><strong>Fondos Insuficientes:</strong> Tu cuenta no tiene suficientes fondos</li>
            <li><strong>Tarjeta Expirada:</strong> Verifica la fecha de vencimiento de tu tarjeta</li>
            <li><strong>Datos Incorrectos:</strong> Asegúrate de ingresar correctamente tus datos</li>
            <li><strong>Conexión:</strong> Hubo un problema de conexión durante el pago</li>
            <li><strong>Límite de Transacciones:</strong> Tu banco podría haber rechazado la transacción</li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <router-link 
            to="/" 
            class="btn btn-tertiary btn-large"
          >
            Volver al Inicio
          </router-link>
        </div>

        <!-- Contact Info -->
        <div class="contact-section">
          <h4>¿Necesitas Ayuda?</h4>
          <p>Contacta con nosotros en <strong>soporte@cinea.com</strong></p>
          <p>Teléfono: <strong>+34 91 123 4567</strong></p>
          <p class="hours">Lun-Dom: 10:00 - 22:00</p>
        </div>

        <!-- Security Info -->
        <div class="security-info">
          <p>Tu información está completamente segura. No te cobraremos por este intento fallido.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appConfig } from '../config/appConfig'

const router = useRouter()
const route = useRoute()

const ticketParam = ref('')
const errorReasonCode = ref('')

const errorMessage = computed(() => {
  const code = route.query.error || errorReasonCode.value
  const errorMessages = {
    'insufficient_funds': 'Tu cuenta no tiene fondos suficientes para completar esta transacción.',
    'card_declined': 'Tu banco ha rechazado esta transacción. Intenta con otra tarjeta o método de pago.',
    'expired_card': 'Tu tarjeta de crédito ha expirado. Por favor, usa otra tarjeta válida.',
    'invalid_cvv': 'El CVV (código de seguridad) que ingresaste es incorrecto.',
    'network_error': 'Hubo un problema de conexión durante el pago. Intenta de nuevo en unos momentos.',
    'gateway_timeout': 'El servidor de pago tardó demasiado en responder. Por favor, intenta de nuevo.',
    'authentication_failed': 'La autenticación del pago falló. Verifica tus datos e intenta de nuevo.',
    'duplicate_transaction': 'Parece que esta transacción ya fue procesada. Intenta con un monto diferente.',
    'unknown_error': 'Ocurrió un error inesperado al procesar tu pago. Por favor, intenta de nuevo más tarde.',
  }
  
  return errorMessages[code] || errorMessages['unknown_error']
})

onMounted(() => {
  ticketParam.value = route.query.reference || route.query.code || 'SIN-REFERENCIA'
  if (route.query.error) {
    errorReasonCode.value = route.query.error
  }
  window.scrollTo(0, 0)
})

const handleRetry = () => {
  router.push({ name: 'Checkout' })
}
</script>

<style scoped>
.payment-failed-page {
  min-height: 100vh;
  padding: 2rem 0;
  background: var(--bg-primary, #0f0f0f);
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 700px;
  width: 100%;
  padding: 0 1rem;
}

.failed-card {
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem 2rem;
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-link {
  display: inline-block;
  margin-bottom: 2rem;
  color: var(--primary, #667eea);
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #764ba2;
}

.failed-header {
  text-align: center;
  margin-bottom: 2rem;
}

.failed-icon-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
  animation: shake 0.6s ease-out;
  position: relative;
}

.failed-icon-large.icon-error::before {
  content: '';
  width: 40px;
  height: 40px;
  border: 3px solid white;
  border-radius: 50%;
  position: relative;
}

.failed-icon-large.icon-error::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 3px;
  background: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

h1 {
  color: var(--primary, #667eea);
  font-size: 2.5rem;
  margin: 0;
  margin-bottom: 0.5rem;
}

.failed-subtitle {
  color: #e0e0e0;
  font-size: 1.1rem;
  margin: 0;
}

.error-details {
  background: rgba(102, 126, 234, 0.15);
  border-left: 4px solid var(--primary, #667eea);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.error-details h3 {
  color: var(--primary, #667eea);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.error-message {
  color: #e0e0e0;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.error-code {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.error-code .label {
  color: #999;
  font-weight: 600;
}

.error-code .code {
  font-family: 'Courier New', monospace;
  color: var(--primary, #667eea);
  font-weight: bold;
  font-size: 1.05rem;
}

.reasons-section {
  background: rgba(45, 45, 45, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--primary, #667eea);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.reasons-section h3 {
  color: var(--primary, #667eea);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.reasons-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reasons-list li {
  padding: 0.75rem 0;
  color: #e0e0e0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  line-height: 1.5;
}

.reasons-list li:last-child {
  border-bottom: none;
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary-transparent {
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
  background: #f5f5f5;
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
  font-size: 1.1rem;
}

.contact-section p {
  margin: 0.3rem 0;
}

.contact-section .hours {
  font-size: 0.9rem;
  color: #999;
}

.security-info {
  text-align: center;
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 1.2rem;
  color: var(--primary, #667eea);
  margin-top: 1.5rem;
}

.security-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.security-info p {
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
  color: #e0e0e0;
}

/* Responsive */
@media (max-width: 600px) {
  .failed-card {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  .failed-icon-large {
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

  .error-code {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
