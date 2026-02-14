<template>
  <div class="credit-card-form">
    <h3>Información de Tarjeta de Crédito</h3>

    <form @submit.prevent="submitForm">
      <!-- Card Number -->
      <div class="form-group">
        <label for="cardNumber">Número de Tarjeta</label>
        <div class="card-input">
          <input
            id="cardNumber"
            v-model="form.cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            @input="formatCardNumber"
            @keydown="handleCardInput"
            required
          >
          <span class="card-icon" :class="`card-${getCardType}`">{{ cardTypeIcon }}</span>
        </div>
        <small v-if="cardError" class="error-text">{{ cardError }}</small>
      </div>

      <!-- Holder Name -->
      <div class="form-group">
        <label for="cardHolder">Nombre del Titular</label>
        <input
          id="cardHolder"
          v-model="form.cardHolder"
          type="text"
          placeholder="JUAN PEREZ GARCIA"
          required
        >
      </div>

      <!-- Expiry and CVV Row -->
      <div class="form-row">
        <!-- Expiry Date -->
        <div class="form-group">
          <label for="expiryMonth">Vencimiento</label>
          <div class="expiry-inputs">
            <select
              id="expiryMonth"
              v-model="form.expiryMonth"
              required
            >
              <option value="">MM</option>
              <option v-for="month in 12" :key="month" :value="String(month).padStart(2, '0')">
                {{ String(month).padStart(2, '0') }}
              </option>
            </select>
            <span>/</span>
            <select
              id="expiryYear"
              v-model="form.expiryYear"
              required
            >
              <option value="">YY</option>
              <option v-for="year in yearRange" :key="year" :value="String(year).slice(-2)">
                {{ String(year).slice(-2) }}
              </option>
            </select>
          </div>
          <small v-if="expiryError" class="error-text">{{ expiryError }}</small>
        </div>

        <!-- CVV -->
        <div class="form-group">
          <label for="cvv">CVV</label>
          <div class="cvv-input">
            <input
              id="cvv"
              v-model="form.cvv"
              type="text"
              placeholder="123"
              maxlength="4"
              @input="formatCVV"
              required
            >
            <span class="cvv-help" @click="showCVVInfo = !showCVVInfo">?</span>
          </div>
          <small v-if="cvvError" class="error-text">{{ cvvError }}</small>
        </div>
      </div>

      <!-- CVV Info Popup -->
      <div v-if="showCVVInfo" class="cvv-info">
        <p>El CVV es un código de 3 o 4 dígitos en el reverso de tu tarjeta.</p>
      </div>

      <!-- Billing Address (Optional) -->
      <details class="form-details">
        <summary>Dirección de Facturación (Opcional)</summary>
        
        <div class="form-group">
          <label for="address">Dirección</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            placeholder="Calle 123"
          >
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">Ciudad</label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              placeholder="Madrid"
            >
          </div>
          
          <div class="form-group">
            <label for="postalCode">Código Postal</label>
            <input
              id="postalCode"
              v-model="form.postalCode"
              type="text"
              placeholder="28001"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="country">País</label>
          <select id="country" v-model="form.country">
            <option value="ES">España</option>
            <option value="MX">México</option>
            <option value="AR">Argentina</option>
            <option value="CO">Colombia</option>
            <option value="PE">Perú</option>
          </select>
        </div>
      </details>

      <!-- Security Notice -->
      <div class="security-notice">
        🔒 Tu información de tarjeta es protegida con encriptación SSL. Nunca almacenamos datos completos de tarjeta.
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary btn-submit"
        :disabled="loading || !isFormValid"
      >
        <span v-if="!loading">Pagar {{ amount }}$</span>
        <span v-else>Procesando...</span>
      </button>

      <!-- Error Message -->
      <div v-if="submitError" class="error-message">
        {{ submitError }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { paymentService } from '@/services/paymentService'

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  paymentProviderId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['payment-success', 'payment-error'])

const form = ref({
  cardNumber: '',
  cardHolder: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'ES'
})

const loading = ref(false)
const showCVVInfo = ref(false)
const submitError = ref(null)
const cardError = ref(null)
const expiryError = ref(null)
const cvvError = ref(null)

const getCardType = computed(() => {
  const number = form.value.cardNumber.replace(/\s/g, '')
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) return 'visa'
  if (/^5[1-5][0-9]{14}$/.test(number)) return 'mastercard'
  if (/^3[47][0-9]{13}$/.test(number)) return 'amex'
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number)) return 'discover'
  return 'unknown'
})

const cardTypeIcon = computed(() => {
  const icons = {
    visa: '💳 Visa',
    mastercard: '💳 Mastercard',
    amex: '💳 Amex',
    discover: '💳 Discover',
    unknown: '💳'
  }
  return icons[getCardType.value] || icons.unknown
})

const yearRange = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 20 }, (_, i) => current + i)
})

const isFormValid = computed(() => {
  return (
    form.value.cardNumber &&
    form.value.cardHolder &&
    form.value.expiryMonth &&
    form.value.expiryYear &&
    form.value.cvv &&
    !cardError.value &&
    !expiryError.value &&
    !cvvError.value
  )
})

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, '')
  const chunks = value.match(/\d{1,4}/g) || []
  form.value.cardNumber = chunks.join(' ')

  // Validar número de tarjeta
  if (value.length >= 13) {
    if (!paymentService.validateCardNumber(value)) {
      cardError.value = 'Número de tarjeta inválido'
    } else {
      cardError.value = null
    }
  } else {
    cardError.value = null
  }
}

const handleCardInput = (event) => {
  if (event.key === 'Backspace') return
  const value = event.target.value.replace(/\s/g, '')
  if (value.length > 19) {
    event.preventDefault()
  }
}

const formatCVV = (event) => {
  form.value.cvv = event.target.value.replace(/\D/g, '')
  
  if (form.value.cvv.length >= 3) {
    if (!paymentService.validateCVV(form.value.cvv)) {
      cvvError.value = 'CVV debe tener 3 o 4 dígitos'
    } else {
      cvvError.value = null
    }
  } else {
    cvvError.value = null
  }
}

const validateExpiry = () => {
  const month = form.value.expiryMonth
  const year = form.value.expiryYear

  if (!month || !year) {
    expiryError.value = 'Selecciona mes y año'
    return false
  }

  if (!paymentService.validateExpiryDate(month, '20' + year)) {
    expiryError.value = 'Tarjeta expirada'
    return false
  }

  expiryError.value = null
  return true
}

const submitForm = async () => {
  if (!isFormValid.value) {
    submitError.value = 'Por favor completa todos los campos correctamente'
    return
  }

  if (!validateExpiry()) {
    return
  }

  loading.value = true
  submitError.value = null

  try {
    // Aquí iría la lógica real de procesamiento de pago
    // Por ahora, emitimos un evento de éxito simulado
    
    const paymentData = {
      card_number: form.value.cardNumber.replace(/\s/g, ''),
      card_holder: form.value.cardHolder,
      expiry_month: form.value.expiryMonth,
      expiry_year: form.value.expiryYear,
      cvv: form.value.cvv,
      amount: props.amount,
      // Datos de facturación opcionales
      ...(form.value.address && {
        billing_address: {
          address: form.value.address,
          city: form.value.city,
          postal_code: form.value.postalCode,
          country: form.value.country
        }
      })
    }

    // Simular procesamiento de pago
    console.log('Processing payment with:', paymentData)
    
    // En producción, esto llamaría al servicio de pago real
    emit('payment-success', {
      amount: props.amount,
      provider_id: props.paymentProviderId,
      last_four_digits: form.value.cardNumber.slice(-4)
    })

  } catch (error) {
    console.error('Payment error:', error)
    submitError.value = 'Error procesando el pago. Por favor intenta de nuevo.'
    emit('payment-error', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.credit-card-form {
  background: var(--gray-dark);
  border: 1px solid var(--gray-darker);
  border-radius: var(--border-radius-sm);
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: var(--shadow-sm);
}

.credit-card-form h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-darker);
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.card-input {
  position: relative;
}

.card-input input {
  padding-right: 3rem;
}

.card-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.expiry-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expiry-inputs select {
  flex: 1;
}

.expiry-inputs span {
  color: var(--text-muted);
  font-weight: 600;
}

.cvv-input {
  position: relative;
}

.cvv-input input {
  padding-right: 2.5rem;
}

.cvv-help {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-darker);
  border-radius: 50%;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.875rem;
  border: 1px solid var(--gray-darker);
}

.cvv-help:hover {
  background: rgba(102, 126, 234, 0.15);
}

.cvv-info {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--warning);
}

.form-details {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.form-details summary {
  font-weight: 600;
  color: #374151;
  user-select: none;
}

.form-details[open] summary {
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.security-notice {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 0.875rem;
  color: var(--success);
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  /* Mantener ajustes específicos, pero delegar colores y sombras a clases globales */
  background: transparent; /* color aplicado por .btn-primary */
  color: inherit;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-lg);
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.error-text,
.error-message {
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .credit-card-form {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
