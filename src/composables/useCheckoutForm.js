import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { paymentService } from '@/services/paymentService'

const STORAGE_KEY = 'cinea_checkout_form'
const BASE_PRICE = 8

/**
 * Composable para manejar la lógica del formulario de checkout
 * Incluye: validación, persistencia, y procesamiento de pagos
 */
export function useCheckoutForm() {
  const router = useRouter()
  const cartStore = useCartStore()

  // Estado del formulario
  const form = ref({
    email: '',
    name: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  })

  const isProcessing = ref(false)
  const isRedirecting = ref(false)
  const error = ref('')
  const selectedPaymentMethod = ref(null)
  const paymentProviders = ref([])

  /**
   * Cargar datos del formulario desde localStorage
   */
  const loadFormData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        form.value = { ...form.value, ...data }
      }
    } catch (err) {
      console.error('Error loading checkout form:', err)
    }
  }

  /**
   * Guardar datos del formulario en localStorage
   */
  const saveFormData = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form.value))
    } catch (err) {
      console.error('Error saving checkout form:', err)
    }
  }

  /**
   * Limpiar datos del formulario del localStorage
   */
  const clearFormData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      form.value = {
        email: '',
        name: '',
        phone: '',
        cardNumber: '',
        cardExpiry: '',
        cardCVC: '',
      }
    } catch (err) {
      console.error('Error clearing checkout form:', err)
    }
  }

  /**
   * Calcular subtotal (cantidad de asientos × precio base)
   */
  const subtotal = computed(() => {
    return cartStore.items.length * BASE_PRICE
  })

  /**
   * Validar campos del formulario
   */
  const validateForm = () => {
    if (!form.value.email) {
      error.value = 'El correo es requerido'
      return false
    }
    if (!form.value.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      error.value = 'El correo no es válido'
      return false
    }
    return true
  }

  /**
   * Formatear número de tarjeta con espacios
   */
  const formatCardNumber = () => {
    let value = form.value.cardNumber.replace(/\s/g, '')
    let formatted = ''
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' '
      }
      formatted += value[i]
    }
    form.value.cardNumber = formatted
  }

  /**
   * Formatear fecha de expiración (MM/YY)
   */
  const formatExpiryDate = () => {
    let value = form.value.cardExpiry.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4)
    }
    form.value.cardExpiry = value
  }

  /**
   * Formatear CVC (solo números)
   */
  const formatCVC = () => {
    form.value.cardCVC = form.value.cardCVC.replace(/\D/g, '').slice(0, 3)
  }

  /**
   * Cargar métodos de pago disponibles
   */
  const loadPaymentProviders = async () => {
    try {
      const providers = await paymentService.getPaymentProviders()
      paymentProviders.value = providers

      // Auto-seleccionar si hay solo un método
      if (providers.length === 1) {
        selectedPaymentMethod.value = providers[0].id
      }

      console.log('Filtered payment providers:', paymentProviders.value)
    } catch (err) {
      console.error('Error loading payment providers:', err)
      error.value = 'No se pudieron cargar los métodos de pago'
    }
  }

  /**
   * Ir atrás para modificar asientos
   * Vuelve a la pantalla de booking con la screening correcta
   */
  const goBack = () => {
    // Si hay screening_id en el carrito, mantener el contexto
    if (cartStore.screeningId) {
      router.push(`/booking/${cartStore.screeningId}`)
    } else {
      router.push('/booking')
    }
  }

  /**
   * Procesar el pago (BATCH: todos los asientos en UN solo request)
   * Esto es más eficiente y evita redireccionamientos prematuros
   */
  const processPayment = async () => {
    if (!selectedPaymentMethod.value) {
      error.value = 'Por favor selecciona un método de pago'
      return
    }

    if (!validateForm()) {
      return
    }

    if (cartStore.items.length === 0) {
      error.value = 'El carrito está vacío'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      // Preparar request BATCH con TODOS los asientos
      const seatIds = cartStore.items.map(item => item.seat_id)
      const screeningId = cartStore.items[0]?.screening_id

      if (!screeningId) {
        error.value = 'Error: falta la información de la sesión'
        isProcessing.value = false
        return
      }

      // Llenar valores por defecto si están vacíos
      const customerEmail = form.value.email || 'default@gmail.com'
      const customerName = form.value.name || 'default'
      const customerPhone = form.value.phone || '000000'

      const batchPaymentData = {
        screening_id: screeningId,
        seat_ids: seatIds,
        payment_provider_id: selectedPaymentMethod.value,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
      }

      // 🔍 DEBUGGING: Verificar datos enviados
      console.log('=== BATCH PAYMENT DEBUG ===')
      console.log('Cart items count:', cartStore.items.length)
      console.log('Cart items:', cartStore.items)
      console.log('Seat IDs:', seatIds)
      console.log('Seat IDs count:', seatIds.length)
      console.log('Expected total (items × $8):', cartStore.items.length * 8)
      console.log('Sending BATCH payment request:', batchPaymentData)
      console.log('===========================')

      // Procesar TODOS los asientos en UN solo request (más eficiente)
      const paymentResponse = await paymentService.processBatchPayment(batchPaymentData)

      console.log('Batch payment response:', paymentResponse)

      if (!paymentResponse || !paymentResponse.success) {
        error.value = paymentResponse?.message || 'Error al procesar el pago. Intenta de nuevo.'
        isProcessing.value = false
        return
      }

      // 🔍 DEBUGGING: Verificar respuesta del backend
      console.log('=== BATCH PAYMENT RESPONSE DEBUG ===')
      console.log('Response success:', paymentResponse.success)
      console.log('Tickets processed:', paymentResponse.tickets_count)
      console.log('Tickets data:', paymentResponse.tickets)
      console.log('Total price from backend:', paymentResponse.total_price)
      console.log('Cart total price (frontend):', cartStore.totalPrice)
      console.log('Match?', paymentResponse.total_price === cartStore.totalPrice)
      console.log('====================================')

      // Verificar si el total es incorrecto
      if (paymentResponse.total_price !== cartStore.totalPrice) {
        console.warn('⚠️ WARNING: Total mismatch!')
        console.warn(`Backend calculated: $${paymentResponse.total_price}`)
        console.warn(`Frontend expected: $${cartStore.totalPrice}`)
        console.warn(`Items in cart: ${cartStore.items.length}`)
        console.warn(`Tickets in response: ${paymentResponse.tickets_count}`)
      }

      // Verificar si requiere redirección
      const provider = paymentProviders.value.find(p => p.id === selectedPaymentMethod.value)
      const redirectUrl = paymentResponse.redirect_url

      console.log(`Batch payment successful! Processed ${paymentResponse.tickets_count} tickets with total: $${paymentResponse.total_price}`)

      if (provider && provider.requires_redirect && redirectUrl) {
        console.log('Redirecting to payment provider:', redirectUrl)
        isRedirecting.value = true
        cartStore.clearCart()
        clearFormData()
        // Pequeño delay para mostrar el loader
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 500)
        return
      }

      // Si llegamos aquí, el pago fue exitoso sin redireccionamiento
      isProcessing.value = false
      cartStore.clearCart()
      clearFormData()
      router.push('/confirmation')
    } catch (err) {
      console.error('Batch payment processing error:', err)
      error.value = 'Error al procesar el pago. Por favor intenta de nuevo.'
      isProcessing.value = false
    }
  }

  return {
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
    validateForm,
    formatCardNumber,
    formatExpiryDate,
    formatCVC,
    loadPaymentProviders,
    goBack,
    processPayment,
  }
}
