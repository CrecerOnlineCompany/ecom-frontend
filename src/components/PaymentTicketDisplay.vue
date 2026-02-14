<template>
  <div class="payment-ticket-display">
    <!-- Ticket Number - Big & Bold -->
    <div class="ticket-header">
      <p class="ticket-label">Número de Transacción</p>
      <div class="ticket-number-container">
        <div class="ticket-number-glow"></div>
        <h1 class="ticket-number">{{ ticketNumber }}</h1>
      </div>
      <p class="ticket-amount">${{ amount.toFixed(2) }}</p>
    </div>

    <!-- Animated Instructions -->
    <div class="instructions-container">
      <div v-if="paymentMethod === 'qr'" class="instructions-qr">
        <div class="instruction-step">
          <div class="step-icon phone">
            <span class="icon-content">📱</span>
          </div>
          <div class="step-content">
            <h3>Abre tu Billetera Digital</h3>
            <p>Mercado Pago, Ualá o tu app preferida</p>
          </div>
        </div>

        <div class="arrow-divider">
          <span class="arrow">↓</span>
        </div>

        <div class="instruction-step">
          <div class="step-icon scan">
            <span class="icon-content">🔍</span>
          </div>
          <div class="step-content">
            <h3>Toca "Escanear QR"</h3>
            <p>Busca la opción de código QR en tu app</p>
          </div>
        </div>

        <div class="arrow-divider">
          <span class="arrow">↓</span>
        </div>

        <div class="instruction-step">
          <div class="step-icon qr">
            <span class="icon-content">📲</span>
          </div>
          <div class="step-content">
            <h3>Apunta a este Código</h3>
            <p>Mantén tu teléfono arriba del QR</p>
          </div>
        </div>

        <div class="arrow-divider">
          <span class="arrow">↓</span>
        </div>

        <div class="instruction-step">
          <div class="step-icon confirm">
            <span class="icon-content">✓</span>
          </div>
          <div class="step-content">
            <h3>Confirma el Pago</h3>
            <p>Sigue los pasos en tu teléfono</p>
          </div>
        </div>
      </div>

      <div v-else-if="paymentMethod === 'terminal'" class="instructions-terminal">
        <div class="instruction-step">
          <div class="step-icon card">
            <span class="icon-content">💳</span>
          </div>
          <div class="step-content">
            <h3>Prepara tu Tarjeta</h3>
            <p>Débito, crédito o billetera digital</p>
          </div>
        </div>

        <div class="arrow-divider">
          <span class="arrow">↓</span>
        </div>

        <div class="instruction-step">
          <div class="step-icon tap">
            <span class="icon-content">📍</span>
          </div>
          <div class="step-content">
            <h3>Acerca tu Tarjeta</h3>
            <p>Toca la terminal Smart Point cuando indique</p>
          </div>
        </div>

        <div class="arrow-divider">
          <span class="arrow">↓</span>
        </div>

        <div class="instruction-step">
          <div class="step-icon pin">
            <span class="icon-content">🔐</span>
          </div>
          <div class="step-content">
            <h3>Ingresa tu PIN (si es necesario)</h3>
            <p>Algunos pagos requieren confirmación</p>
          </div>
        </div>

        <div class="arrow-divider">
          <span class="arrow">↓</span>
        </div>

        <div class="instruction-step">
          <div class="step-icon done">
            <span class="icon-content">✓</span>
          </div>
          <div class="step-content">
            <h3>¡Listo!</h3>
            <p>Tu pago ha sido procesado</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Indicator -->
    <div class="status-indicator">
      <div class="pulse-animation"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  ticketNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['qr', 'terminal'],
    required: true
  },
  statusText: {
    type: String,
    default: 'Esperando confirmación del pago...'
  }
})
</script>

<style scoped>
.payment-ticket-display {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 12px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ========== TICKET HEADER ========== */
.ticket-header {
  text-align: center;
  padding: 2rem;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.ticket-label {
  margin: 0;
  font-size: 0.95rem;
  color: #7dd3fc;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.ticket-number-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.ticket-number-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  animation: pulse-glow 2.5s ease-in-out infinite;
}

.ticket-number {
  margin: 0;
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  position: relative;
  z-index: 2;
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
}

.ticket-amount {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  margin-top: 1rem;
  animation: fadeIn 1s ease-out 0.4s both;
}

/* ========== INSTRUCTIONS ========== */
.instructions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.instruction-step {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  animation: slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-fill-mode: both;
}

.instruction-step:nth-child(1) { animation-delay: 0.1s; }
.instruction-step:nth-child(3) { animation-delay: 0.2s; }
.instruction-step:nth-child(5) { animation-delay: 0.3s; }
.instruction-step:nth-child(7) { animation-delay: 0.4s; }
.instruction-step:nth-child(9) { animation-delay: 0.5s; }

.step-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.8rem;
  position: relative;
  border: 2px solid rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
  transition: all 0.3s ease;
}

.step-icon.phone {
  border-color: #3b82f6;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.1s;
}

.step-icon.scan {
  border-color: #06b6d4;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.3s;
}

.step-icon.qr {
  border-color: #8b5cf6;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.step-icon.confirm {
  border-color: #10b981;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.7s;
}

.step-icon.card {
  border-color: #3b82f6;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.1s;
}

.step-icon.tap {
  border-color: #06b6d4;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.3s;
}

.step-icon.pin {
  border-color: #f59e0b;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.step-icon.done {
  border-color: #10b981;
  animation: iconBounce 1.5s ease-in-out infinite;
  animation-delay: 0.7s;
}

.icon-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content h3 {
  margin: 0 0 0.4rem 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
}

.step-content p {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* ========== ARROW DIVIDER ========== */
.arrow-divider {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
  animation: slideDown 0.8s ease-in-out infinite;
}

.arrow {
  font-size: 1.5rem;
  color: rgba(59, 130, 246, 0.5);
  font-weight: bold;
}

/* ========== STATUS INDICATOR ========== */
.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  margin-top: 1rem;
}

.pulse-animation {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulse 2s ease-in-out infinite;
}

.status-text {
  color: #7dd3fc;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* ========== ANIMATIONS ========== */

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDown {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(8px);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.2;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* ========== RESPONSIVE ========== */

@media (max-width: 768px) {
  .payment-ticket-display {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .ticket-header {
    padding: 1.5rem;
  }

  .ticket-number {
    font-size: 2.5rem;
    letter-spacing: 2px;
  }

  .ticket-amount {
    font-size: 1.2rem;
  }

  .instructions-container {
    padding: 1.5rem;
    gap: 1rem;
  }

  .instruction-step {
    gap: 1rem;
  }

  .step-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .step-content h3 {
    font-size: 0.95rem;
  }

  .step-content p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .payment-ticket-display {
    padding: 1rem;
    gap: 1rem;
  }

  .ticket-header {
    padding: 1rem;
  }

  .ticket-label {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .ticket-number {
    font-size: 2rem;
    letter-spacing: 1px;
  }

  .ticket-amount {
    font-size: 1rem;
    margin-top: 0.75rem;
  }

  .instructions-container {
    padding: 1rem;
    gap: 0.75rem;
  }

  .instruction-step {
    gap: 0.75rem;
  }

  .step-icon {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }

  .step-content h3 {
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
  }

  .step-content p {
    font-size: 0.8rem;
  }

  .arrow-divider {
    padding: 0.3rem 0;
  }

  .arrow {
    font-size: 1.2rem;
  }

  .status-indicator {
    padding: 1rem;
    gap: 0.75rem;
  }

  .status-text {
    font-size: 0.9rem;
  }
}
</style>
