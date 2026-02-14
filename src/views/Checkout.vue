<template>
  <div class="checkout-page">
    <!-- Loader especial de redirección -->
    <div v-if="isRedirecting" class="redirect-loader-overlay">
      <div class="redirect-loader-content">
        <div class="spinner-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <h2>Redirigiendo al sistema de pago...</h2>
        <p>Por favor espera mientras te redirigimos a nuestro procesador de pagos seguro.</p>
      </div>
    </div>

    <div class="container">
      <h1>Completar Compra</h1>

      <div class="checkout-layout">
        <!-- Order Summary -->
        <div class="order-summary">
          <h2>Resumen de Pedido</h2>

          <div v-if="cartStore.items.length > 0" class="order-content">
            <div class="items-section">
              <h4>Entradas Seleccionadas</h4>
              <div class="order-items">
                <div v-for="item in cartStore.items" :key="item.id" class="order-item">
                  <div class="item-details">
                    <p class="item-label">Asiento {{ item.seat_label }}</p>
                    <p class="item-movie" v-if="item.movie_title">{{ item.movie_title }}</p>
                  </div>
                  <div class="item-actions">
                    <span class="item-price">${{ item.price }}</span>
                    <button 
                      @click="removeItemFromCart(item.id)"
                      class="btn-remove"
                      title="Remover esta entrada"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-divider"></div>

            <div class="totals-section">
              <div class="total-row">
                <span>Entradas ({{ cartStore.items.length }}):</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="total-row large">
                <span>Total:</span>
                <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <button @click="goBack" class="btn btn-secondary">
            Modificar Asientos
          </button>
        </div>

        <!-- Payment Form -->
        <div class="payment-form">
          <h2>Información de Pago</h2>

          <!-- Payment Method Selector -->
          <div class="payment-method-section">
            <h3>Método de Pago</h3>
            <PaymentMethodSelector v-model="selectedPaymentMethod" />
          </div>

          <!-- Mercado Pago Variant Selection -->
          <div v-if="selectedPaymentMethod && isMercadoPago" class="payment-variant-section">
            <h3>Selecciona cómo pagar con Mercado Pago</h3>
            <div class="variant-options">
              <div
                :class="['variant-option', { active: paymentMethodType === 'qr' }]"
                @click="paymentMethodType = 'qr'"
              >
                <div class="variant-icon">📱</div>
                <h4>Código QR</h4>
                <p>Escanea con tu teléfono</p>
              </div>
              <div
                :class="['variant-option', { active: paymentMethodType === 'terminal' }]"
                @click="paymentMethodType = 'terminal'"
              >
                <div class="variant-icon">🏪</div>
                <h4>Terminal Smart Point</h4>
                <p>Acerca tu tarjeta</p>
              </div>
              <div
                :class="['variant-option', { active: paymentMethodType === 'redirect' }]"
                @click="paymentMethodType = 'redirect'"
              >
                <div class="variant-icon">🔐</div>
                <h4>Redirección Segura</h4>
                <p>Paga de forma segura</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="processPayment">
            <!-- Personal Information -->
            <fieldset class="form-section">
              <legend>Datos Personales</legend>

              <div class="form-group">
                <label for="email">Email:</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                >
              </div>

              <!-- Name and Phone hidden -->
              <div class="form-group" style="display: none;">
                <label for="name">Nombre Completo:</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Juan Pérez"
                >
              </div>

              <div class="form-group" style="display: none;">
                <label for="phone">Teléfono:</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="+34 612 345 678"
                >
              </div>
            </fieldset>

            <!-- QR Payment -->
            <QRPaymentCard
              v-if="selectedPaymentMethod && paymentMethodType === 'qr'"
              :payment-provider-id="selectedPaymentMethod"
              :amount="cartStore.totalPrice"
              :screening-id="selectedScreeningId"
              :seat-ids="seatIds"
              :customer-email="form.email"
              :customer-name="form.name"
              @payment-success="handleQRPaymentSuccess"
              @payment-error="handlePaymentError"
              @payment-cancelled="handlePaymentCancelled"
            />

            <!-- Terminal Smart Point Payment -->
            <SmartPointCard
              v-else-if="selectedPaymentMethod && paymentMethodType === 'terminal'"
              :payment-provider-id="selectedPaymentMethod"
              :amount="cartStore.totalPrice"
              :screening-id="selectedScreeningId"
              :seat-ids="seatIds"
              :customer-email="form.email"
              :customer-name="form.name"
              @payment-success="handleTerminalPaymentSuccess"
              @payment-error="handlePaymentError"
              @payment-cancelled="handlePaymentCancelled"
            />

            <!-- Card Information - Only for non-redirect methods -->
            <fieldset v-else-if="selectedPaymentMethod && !paymentMethodRequiresRedirect && paymentMethodType !== 'qr' && paymentMethodType !== 'terminal'" class="form-section">
              <legend>Tarjeta de Crédito</legend>

              <div class="form-group">
                <label for="cardNumber">Número de Tarjeta:</label>
                <input
                  id="cardNumber"
                  v-model="form.cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  @input="formatCardNumber"
                  @blur="saveFormData"
                  required
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="cardExpiry">Vencimiento (MM/YY):</label>
                  <input
                    id="cardExpiry"
                    v-model="form.cardExpiry"
                    type="text"
                    placeholder="MM/YY"
                    maxlength="5"
                    @input="formatExpiryDate"
                    @blur="saveFormData"
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="cardCVC">CVV:</label>
                  <input
                    id="cardCVC"
                    v-model="form.cardCVC"
                    type="text"
                    placeholder="123"
                    maxlength="4"
                    @input="formatCVC"
                    @blur="saveFormData"
                    required
                  >
                </div>
              </div>
            </fieldset>

            <!-- Redirect Payment Info -->
            <div v-else-if="selectedPaymentMethod && paymentMethodRequiresRedirect && paymentMethodType !== 'qr' && paymentMethodType !== 'terminal'" class="form-section redirect-info">
              <div class="info-box">
                <h4>🔒 Pago Seguro</h4>
                <p>Serás redirigido a {{ selectedPaymentMethodName }} para completar el pago de forma segura.</p>
                <p class="small-text">Tu información de pago será procesada de manera segura por {{ selectedPaymentMethodName }}.</p>
              </div>
            </div>

            <!-- Terms -->
            <div class="form-group checkbox">
              <input
                id="terms"
                v-model="form.acceptTerms"
                type="checkbox"
                required
              >
              <label for="terms">
                Acepto los términos y condiciones de compra
              </label>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button
                type="submit"
                :disabled="isProcessing || !selectedPaymentMethod"
                class="btn btn-primary"
              >
                {{ isProcessing ? 'Procesando...' : `Pagar $${cartStore.totalPrice.toFixed(2)}` }}
              </button>
            </div>

            <p v-if="error" class="error-message">
              {{ error }}
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useCheckoutForm } from '@/composables/useCheckoutForm'
import PaymentMethodSelector from '@/components/PaymentMethodSelector.vue'
import QRPaymentCard from '@/components/QRPaymentCard.vue'
import SmartPointCard from '@/components/SmartPointCard.vue'
import '@/styles/checkout.css'

const router = useRouter()
const cartStore = useCartStore()

const {
  form,
  isProcessing,
  isRedirecting,
  error,
  selectedPaymentMethod,
  paymentProviders,
  subtotal,
  loadFormData,
  saveFormData,
  clearFormData,
  formatCardNumber,
  formatExpiryDate,
  formatCVC,
  loadPaymentProviders,
  goBack,
  processPayment,
} = useCheckoutForm()

// Extender refs para los nuevos métodos de pago
const paymentMethodType = ref(null) // 'qr', 'terminal', 'redirect', null

const selectedPaymentMethodName = computed(() => {
  const provider = paymentProviders.value.find(p => p.id === selectedPaymentMethod.value)
  return provider?.name || ''
})

const paymentMethodRequiresRedirect = computed(() => {
  const provider = paymentProviders.value.find(p => p.id === selectedPaymentMethod.value)
  return provider?.requires_redirect || false
})

/**
 * Determinar si es Mercado Pago
 */
const isMercadoPago = computed(() => {
  const provider = paymentProviders.value.find(p => p.id === selectedPaymentMethod.value)
  return provider?.name?.toLowerCase().includes('mercado') || false
})

/**
 * Determinar tipo de método de pago basado en el proveedor
 */
const determinePaymentMethodType = () => {
  const provider = paymentProviders.value.find(p => p.id === selectedPaymentMethod.value)
  if (!provider) {
    paymentMethodType.value = null
    return
  }

  // Si es mercado_pago, dejar que el usuario elija (default null)
  if (provider.name?.toLowerCase().includes('mercado')) {
    // No asignar automáticamente, dejar que el usuario seleccione
    if (!paymentMethodType.value) {
      paymentMethodType.value = null
    }
  } else if (provider.requires_redirect) {
    paymentMethodType.value = 'redirect'
  } else {
    paymentMethodType.value = 'card'
  }

  console.log('Payment method type determined:', paymentMethodType.value, 'Provider:', provider)
}

/**
 * ID de screening y seat_ids del carrito
 */
const selectedScreeningId = computed(() => {
  // Asumir que todos los items son del mismo screening
  // Si no, necesitarías agrupar por screening
  return cartStore.items[0]?.screening_id || 1
})

const seatIds = computed(() => {
  return cartStore.items.map(item => item.seat_id || item.id)
})

/**
 * Manejar éxito del pago QR
 */
const handleQRPaymentSuccess = async (paymentData) => {
  console.log('QR Payment successful:', paymentData)
  // Redirigir a confirmación
  await router.push({
    name: 'PaymentSuccess',
    params: { transactionId: paymentData.paymentTicketId }
  })
}

/**
 * Manejar éxito del pago Terminal
 */
const handleTerminalPaymentSuccess = async (paymentData) => {
  console.log('Terminal Payment successful:', paymentData)
  // Redirigir a confirmación
  await router.push({
    name: 'PaymentSuccess',
    params: { transactionId: paymentData.orderId }
  })
}

/**
 * Manejar error de pago
 */
const handlePaymentError = (errorMessage) => {
  console.error('Payment error:', errorMessage)
  error.value = errorMessage
}

/**
 * Manejar cancelación de pago
 */
const handlePaymentCancelled = () => {
  console.log('Payment cancelled')
  error.value = 'Pago cancelado por el usuario'
  // Resetear el método seleccionado
  selectedPaymentMethod.value = null
  paymentMethodType.value = null
}

onMounted(async () => {
  // Validar carrito no vacío
  if (cartStore.items.length === 0) {
    error.value = 'El carrito está vacío. Por favor agrega items antes de continuar.'
  }

  // Cargar datos del formulario (persistencia)
  loadFormData()

  // Cargar métodos de pago disponibles
  await loadPaymentProviders()
})

// Detectar tipo de método cuando se selecciona un proveedor
watch(selectedPaymentMethod, () => {
  determinePaymentMethodType()
})

// Auto-guardar datos del formulario cuando cambian
watch(() => form.value, saveFormData, { deep: true })

/**
 * Remover un item del carrito
 */
const removeItemFromCart = (itemId) => {
  cartStore.removeItem(itemId)
  console.log(`Removed item ${itemId} from cart. Items remaining: ${cartStore.items.length}`)
}
</script>

<style scoped>
.checkout-page {
  padding: 2rem 0;
  min-height: 600px;
}

.checkout-page h1 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.order-summary {
  background: #2d2d2d54;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.order-summary h2,
.payment-form h2 {
  color: var(--primary);
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #3d3d3d;
  padding-bottom: 1rem;
}

.order-items {
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #1a1a1a;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  border: 1px solid #3d3d3d;
  gap: 0.75rem;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-label {
  margin: 0;
  color: #ccc;
  font-size: 0.95rem;
  font-weight: 500;
}

.item-movie {
  margin: 0.25rem 0 0 0;
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 400;
}

.item-vip {
  margin: 0.25rem 0 0 0;
  color: #ffa500;
  font-size: 0.8rem;
  font-weight: 600;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.item-price {
  color: var(--primary);
  font-weight: 600;
  min-width: 60px;
  text-align: right;
  font-size: 1rem;
  white-space: nowrap;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
}

.btn-remove:hover {
  background: rgba(255, 107, 107, 0.2);
  color: #ff8787;
}

.btn-remove:active {
  transform: scale(0.95);
}

.order-content {
  margin-bottom: 1.5rem;
}

.items-section h4 {
  margin: 0 0 1rem 0;
  color: #ccc;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-divider {
  height: 1px;
  background: #3d3d3d;
  margin: 1rem 0;
}

.totals-section {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #3d3d3d;
}

.order-totals {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border: 1px solid #3d3d3d;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #ccc;
  font-size: 0.95rem;
}

.total-row.large {
  border-top: 2px solid var(--primary);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  font-size: 1.1rem;
}

.payment-form {
  background: transparent;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
}

.payment-method-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #3d3d3d;
}

.payment-method-section h3 {
  color: #ccc;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.payment-variant-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
}

.payment-variant-section h3 {
  color: var(--primary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.variant-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.variant-option {
  background: #1a1a1a;
  border: 2px solid #3d3d3d;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.variant-option:hover {
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.variant-option.active {
  border-color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.variant-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.variant-option h4 {
  margin: 0.75rem 0 0.5rem 0;
  color: white;
  font-size: 0.95rem;
}

.variant-option p {
  margin: 0;
  color: #999;
  font-size: 0.85rem;
}

.form-section {
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: transparent;
}

.form-section.redirect-info {
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.info-box {
  padding: 1.5rem;
  background: #1a1a1a;
  border-radius: 4px;
}

.info-box h4 {
  margin: 0 0 1rem 0;
  color: var(--primary);
}

.info-box p {
  margin: 0.5rem 0;
  color: #aaa;
  line-height: 1.5;
}

.small-text {
  font-size: 0.85rem;
  color: #888;
}

.form-section legend {
  color: var(--primary);
  font-weight: 600;
  padding: 0 0.5rem;
  margin-left: -0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #ccc;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group input::placeholder {
  color: #666;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.form-group.checkbox input {
  width: auto;
  margin: 0;
}

.form-group.checkbox label {
  margin: 0;
  font-weight: 400;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.error-message {
  color: #ff6b6b;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  margin-bottom: 0;
}

.redirect-loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.redirect-loader-content {
  text-align: center;
  background: #2d2d2d;
  padding: 3rem 2rem;
  border-radius: 12px;
  border: 1px solid #3d3d3d;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  max-width: 400px;
}

.spinner-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  height: 40px;
  align-items: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.redirect-loader-content h2 {
  color: var(--primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.redirect-loader-content p {
  color: #ccc;
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0) translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1) translateY(-20px);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 1.5rem 0;
  }

  .back-link {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .checkout-page h1 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .payment-form {
    padding: 1.25rem;
  }

  .form-section {
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .form-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-group {
    gap: 0.25rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.7rem;
    font-size: 0.95rem;
  }

  .order-summary {
    width: 100%;
    position: static;
    padding: 1.25rem;
  }

  .order-summary h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .items-section h4 {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }

  .order-items {
    max-height: 250px;
    margin-bottom: 1rem;
  }

  .order-item {
    padding: 0.65rem;
    margin-bottom: 0.4rem;
  }

  .item-label {
    font-size: 0.9rem;
  }

  .item-movie {
    font-size: 0.7rem;
  }

  .item-price {
    font-size: 0.9rem;
    min-width: 50px;
  }

  .order-divider {
    margin: 0.75rem 0;
  }

  .totals-section {
    padding: 0.85rem;
  }

  .total-row {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }

  .total-row.large {
    font-size: 1rem;
  }

  .error-message {
    padding: 0.75rem;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .success-message {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .checkout-page {
    padding: 1rem 0;
  }

  .back-link {
    margin-bottom: 0.75rem;
    font-size: 0.8rem;
  }

  .checkout-page h1 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .checkout-layout {
    gap: 1rem;
  }

  .payment-form {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .form-section h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .form-group {
    gap: 0.2rem;
    margin-bottom: 0.5rem;
  }

  .form-group label {
    font-size: 0.8rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .form-row {
    gap: 0.5rem;
  }

  .order-summary {
    padding: 1rem;
  }

  .order-summary h2 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .items-section h4 {
    font-size: 0.85rem;
    margin-bottom: 0.6rem;
  }

  .order-items {
    max-height: 200px;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .order-item {
    padding: 0.55rem;
    gap: 0.35rem;
  }

  .item-details {
    gap: 0.15rem;
    flex: 1;
    min-width: 0;
  }

  .item-label {
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-movie {
    font-size: 0.65rem;
  }

  .item-vip {
    font-size: 0.7rem;
  }

  .item-price {
    font-size: 0.8rem;
    min-width: 45px;
    text-align: right;
  }

  .order-divider {
    margin: 0.5rem 0;
  }

  .totals-section {
    padding: 0.75rem;
  }

  .total-row {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .total-row.large {
    font-size: 0.95rem;
    padding-top: 0.6rem;
    margin-top: 0.6rem;
  }

  .error-message {
    padding: 0.6rem;
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .success-message {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
}
</style>
