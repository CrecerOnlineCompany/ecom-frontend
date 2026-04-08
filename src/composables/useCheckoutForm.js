import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { paymentService } from '@/services/paymentService'
import { processPaymentErrorMessage } from '@/utils/errorHelpers'

const STORAGE_KEY = 'cinea_checkout_form'

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
  const paymentMethodType = ref(null)
  const paymentProviders = ref([])
  const orderExpiresAt = ref(null)
  const showExpirationModal = ref(false)
  const expirationCountdown = ref('00:00')

  const normalizeSeatIds = (seatIds = []) => {
    return [...seatIds].map(id => String(id)).sort()
  }

  const isSameSeatSelection = (left = [], right = []) => {
    const a = normalizeSeatIds(left)
    const b = normalizeSeatIds(right)
    if (a.length !== b.length) return false
    return a.every((value, index) => value === b[index])
  }

  const normalizeProducts = (products = []) => {
    return [...products]
      .map(product => ({
        code: String(product?.code || '').trim().toUpperCase(),
        quantity: Number(product?.quantity) || 0,
      }))
      .filter(product => product.code && product.quantity > 0)
      .sort((a, b) => a.code.localeCompare(b.code))
  }

  const isSameProductSelection = (left = [], right = []) => {
    const a = normalizeProducts(left)
    const b = normalizeProducts(right)
    if (a.length !== b.length) return false
    return a.every((product, index) => {
      const match = b[index]
      return product.code === match.code && product.quantity === match.quantity
    })
  }

  const hasReusableSession = ({ screeningId, seatIds, providerId, methodType }) => {
    const session = cartStore.currentSession
    if (!session || !cartStore.isSessionActive) return false

    const sameScreening = Number(session.screening_id) === Number(screeningId)
    const sameProvider = Number(session.provider_id) === Number(providerId)
    const sameMethod = String(session.payment_method || '') === String(methodType || '')
    const sameSeats = isSameSeatSelection(session.seat_ids || [], seatIds)
    const sameProducts = isSameProductSelection(session.products || [], cartStore.selectedProducts || [])

    return sameScreening && sameProvider && sameMethod && sameSeats && sameProducts
  }

  const getReusableOrderNumber = ({ screeningId, seatIds }) => {
    const session = cartStore.currentSession
    if (!session || !cartStore.isSessionActive) return null

    const sameScreening = Number(session.screening_id) === Number(screeningId)
    const sameSeats = isSameSeatSelection(session.seat_ids || [], seatIds)

    return sameScreening && sameSeats ? session.order_number : null
  }


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
   * Calcular subtotal basado en los precios del carrito
   */
  const subtotal = computed(() => {
    return cartStore.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
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
      const data = await paymentService.getPaymentProviders()
      
      // Extraer lista de proveedores según el formato
      let providersList = []
      if (Array.isArray(data)) {
        providersList = data
      } else if (data.providers && Array.isArray(data.providers)) {
        providersList = data.providers
      } else if (data.data && Array.isArray(data.data)) {
        providersList = data.data
      }
      
      // Normalizar booleanos
      paymentProviders.value = providersList.map(p => ({
        ...p,
        requires_redirect: normalizeBoolean(p.requires_redirect),
        supports_webhook: normalizeBoolean(p.supports_webhook),
        is_active: normalizeBoolean(p.is_active)
      }))

      // Auto-seleccionar si hay solo un método
      if (paymentProviders.value.length === 1) {
        selectedPaymentMethod.value = paymentProviders.value[0].id
      }

      console.log('Loaded payment providers:', paymentProviders.value)
    } catch (err) {
      console.error('Error loading payment providers:', err)
      error.value = 'No se pudieron cargar los métodos de pago'
    }
  }

  /**
   * Normalizar valores a boolean
   */
  const normalizeBoolean = (value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lower = String(value).toLowerCase()
      return lower === 'true' || lower === '1' || lower === 'on' || lower === 'yes'
    }
    if (typeof value === 'number') return value !== 0
    return !!value
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

    if (cartStore.hasMultipleScreenings) {
      error.value = 'No se pueden mezclar funciones en una misma compra. Deja solo una función en el carrito para continuar.'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      // Preparar request BATCH con TODOS los asientos
      const seatIds = cartStore.items.map(item => item.seat_id)
      const screeningIds = [
        ...new Set(
          cartStore.items
            .map(item => Number(item.screening_id))
            .filter(id => Number.isFinite(id) && id > 0)
        )
      ]
      const screeningId = screeningIds.length === 1 ? screeningIds[0] : null
      const provider = paymentProviders.value.find(p => p.id === selectedPaymentMethod.value)
      const requiresRedirect = !!provider?.requires_redirect
      const reusableOrderNumber = getReusableOrderNumber({ screeningId, seatIds })

      if (!screeningId) {
        error.value = 'No se puede procesar el pago porque el carrito tiene funciones inválidas o mezcladas.'
        isProcessing.value = false
        return
      }

      if (
        hasReusableSession({
          screeningId,
          seatIds,
          providerId: selectedPaymentMethod.value,
          methodType: paymentMethodType.value || 'redirect'
        })
      ) {
        const session = cartStore.currentSession

        if (requiresRedirect && session?.redirect_url) {
          isRedirecting.value = true
          setTimeout(() => {
            window.location.href = session.redirect_url
          }, 500)
          return
        }

        error.value = `Ya existe una orden activa (${session?.order_number || 'N/A'}) para esta selección.`
        isProcessing.value = false
        return
      }

      // Llenar valores por defecto si están vacíos
      const customerEmail = form.value.email || 'default@gmail.com'
      const customerName = form.value.name || 'default'
      const customerPhone = form.value.phone || '000000'
      const selectedProducts = normalizeProducts(cartStore.selectedProducts || [])

      // Mantener email consistente durante reintentos del mismo checkout
      if (form.value.email !== customerEmail) {
        form.value.email = customerEmail
      }

      const batchPaymentData = {
        screening_id: screeningId,
        seat_ids: seatIds,
        payment_provider_id: selectedPaymentMethod.value,
        products: selectedProducts,
        order_number: reusableOrderNumber || undefined,
        idempotency_key: cartStore.currentSession?.idempotency_key || undefined,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        additional_data: {
          payment_method: paymentMethodType.value || 'redirect',
          products: selectedProducts,
        },
      }

      // 🔍 DEBUGGING: Verificar datos enviados
      console.log('=== BATCH PAYMENT DEBUG ===')
      console.log('Cart items count:', cartStore.items.length)
      console.log('Cart items:', cartStore.items)
      console.log('Seat IDs:', seatIds)
      console.log('Seat IDs count:', seatIds.length)
      console.log('Expected total (cart effective):', cartStore.effectiveTotalPrice)
      console.log('Payment Method Type:', paymentMethodType.value)
      console.log('Selected Payment Provider ID:', selectedPaymentMethod.value)
      console.log('Sending BATCH payment request:', batchPaymentData)
      console.log('===========================')

      // Procesar TODOS los asientos en UN solo request (más eficiente)
      const paymentResponse = await paymentService.processBatchPayment(batchPaymentData)

      console.log('✅ Batch payment response received:', paymentResponse)

      if (!paymentResponse || !paymentResponse.success) {
        // Procesar mensaje de error con función helper
        error.value = processPaymentErrorMessage(paymentResponse?.message)
        isProcessing.value = false
        return
      }

      // Capturar información de expiración de la orden
      if (paymentResponse.reserved_until) {
        const totalPrice = Number(paymentResponse.total_price)
        const baseSubtotal = Number(paymentResponse.base_subtotal)
        const totalDiscount = Number(paymentResponse.total_discount)

        orderExpiresAt.value = new Date(paymentResponse.reserved_until)
        showExpirationModal.value = true
        startExpirationCountdown()

        cartStore.setPaymentSession({
          order_id: paymentResponse.order_id,
          order_number: paymentResponse.order_number,
          reserved_until: paymentResponse.reserved_until,
          payment_ticket_id: paymentResponse.payment_ticket_id,
          payment_method: paymentMethodType.value || 'redirect',
          provider_id: selectedPaymentMethod.value,
          screening_id: screeningId,
          seat_ids: seatIds,
          idempotency_key: paymentResponse.idempotency_key,
          redirect_url: paymentResponse.redirect_url || null,
          total_price: Number.isFinite(totalPrice) ? totalPrice : undefined,
          base_subtotal: Number.isFinite(baseSubtotal) ? baseSubtotal : undefined,
          total_discount: Number.isFinite(totalDiscount) ? totalDiscount : undefined,
          applied_promotions: Array.isArray(paymentResponse.applied_promotions)
            ? paymentResponse.applied_promotions
            : [],
          products: normalizeProducts(paymentResponse.products || selectedProducts),
          order_items: Array.isArray(paymentResponse.order_items)
            ? paymentResponse.order_items
            : []
        })
      }

      // 🔍 DEBUGGING: Verificar respuesta del backend
      console.log('=== BATCH PAYMENT RESPONSE DEBUG ===')
      console.log('Response success:', paymentResponse.success)
      console.log('Tickets processed:', paymentResponse.tickets_count)
      console.log('Tickets data:', paymentResponse.tickets)
      console.log('Total price from backend:', paymentResponse.total_price)
      console.log('Cart effective total (frontend):', cartStore.effectiveTotalPrice)
      console.log('Match?', Number(paymentResponse.total_price) === Number(cartStore.effectiveTotalPrice))
      console.log('====================================')

      // Verificar si el total es incorrecto
      if (Number(paymentResponse.total_price) !== Number(cartStore.effectiveTotalPrice)) {
        console.warn('⚠️ WARNING: Total mismatch!')
        console.warn(`Backend calculated: $${paymentResponse.total_price}`)
        console.warn(`Frontend expected: $${cartStore.effectiveTotalPrice}`)
        console.warn(`Items in cart: ${cartStore.items.length}`)
        console.warn(`Tickets in response: ${paymentResponse.tickets_count}`)
      }

      // Verificar si requiere redirección
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

  /**
   * Iniciar cuenta regresiva para expiración de la orden
   */
  const startExpirationCountdown = () => {
    if (!orderExpiresAt.value) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = orderExpiresAt.value - now

      if (diff <= 0) {
        expirationCountdown.value = '00:00'
        showExpirationModal.value = false
        error.value = 'La orden ha expirado. Por favor intenta de nuevo.'
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      expirationCountdown.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    // Limpiar interval cuando cierre el modal
    const checkInterval = setInterval(() => {
      if (!showExpirationModal.value) {
        clearInterval(interval)
        clearInterval(checkInterval)
      }
    }, 1000)
  }

  /**
   * Cerrar modal de expiración
   */
  const closeExpirationModal = () => {
    showExpirationModal.value = false
  }

  return {
    form,
    isProcessing,
    isRedirecting,
    error,
    selectedPaymentMethod,
    paymentMethodType,
    paymentProviders,
    subtotal,
    orderExpiresAt,
    showExpirationModal,
    expirationCountdown,
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
    closeExpirationModal,
  }
}
