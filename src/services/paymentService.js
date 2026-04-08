import api from './api'

/**
 * @typedef {import('@/types/payment').PaymentProvider} PaymentProvider
 * @typedef {import('@/types/payment').PaymentProvidersResponse} PaymentProvidersResponse
 */

export const paymentService = {
  /**
   * Obtener lista de proveedores de pago disponibles
   * @returns {Promise<PaymentProvider[]>}
   */
  async getPaymentProviders() {
    try {
      const response = await api.get('/payment-providers')
      
      // Validar respuesta
      if (!response || !response.data) {
        throw new Error('Invalid response from server')
      }

      let data = response.data
      console.log('Raw API response:', data)
      
      // Manejar estructura { success: true, providers: [...], count: N }
      if (data.success && data.providers && Array.isArray(data.providers)) {
        console.log('Found providers in response.providers:', data.providers)
        return data
      }
      
      // Manejar estructura { success: true, data: [...] }
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('Found providers in response.data:', data.data)
        return data.data
      }
      
      // Manejar array directo
      if (Array.isArray(data)) {
        console.log('Found providers as array:', data)
        return data
      }
      
      console.warn('Could not extract providers from response:', data)
      return []
    } catch (error) {
      console.error('Error fetching payment providers:', error)
      throw error
    }
  },

  /**
   * Obtener detalles de un proveedor específico
   */
  async getPaymentProvider(providerId) {
    try {
      const response = await api.get(`/payment-providers/${providerId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching payment provider ${providerId}:`, error)
      throw error
    }
  },

  /**
   * Obtener catálogo de productos de candy bar (pochoclos, combos, etc.)
   * @returns {Promise<Array>}
   */
  async getConcessionProducts() {
    try {
      const response = await api.get('/concession-products')
      const data = response?.data

      if (Array.isArray(data)) return data
      if (Array.isArray(data?.products)) return data.products
      if (data?.success && Array.isArray(data?.data)) return data.data

      return []
    } catch (error) {
      console.error('Error fetching concession products:', error)
      return []
    }
  },

  /**
   * Procesar un pago: Crea ticket Y procesa pago
   * @param {Object} paymentData - {screening_id, seat_id, payment_provider_id, customer_email, customer_name, customer_phone}
   * @returns {Promise<Object>}
   */
  async processPayment(paymentData = {}) {
    try {
      const response = await api.post('/payment-process', paymentData)
      console.log('Payment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  },

  /**
   * Procesar un BATCH de pagos (múltiples asientos en UN solo request)
   * Más eficiente que procesar uno por uno
   * @param {Object} batchPaymentData - {screening_id, seat_ids: [...], payment_provider_id, customer_email, customer_name, customer_phone}
   * @returns {Promise<Object>} - {success, tickets: [...], total_price, tickets_count, transaction_id, redirect_url, requires_redirect}
   */
  async processBatchPayment(batchPaymentData = {}) {
    try {
      const response = await api.post('/payment-process-batch', batchPaymentData)
      console.log('Batch payment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error processing batch payment:', error)
      throw error
    }
  },

  /**
   * Previsualizar pricing (incluye promociones automáticas)
   * @param {Object} payload - {screening_id, seat_ids, promotion_code?}
   * @returns {Promise<Object>}
   */
  async previewPricing(payload = {}) {
    try {
      const response = await api.post('/payment-pricing-preview', payload)
      return response.data
    } catch (error) {
      console.error('Error previewing pricing:', error)
      throw error
    }
  },

  /**
   * Obtener estado de un pago
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payment-status/${paymentId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching payment status ${paymentId}:`, error)
      throw error
    }
  },

  /**
   * Obtener detalle completo de una orden de pago
   * @param {string} orderNumber
   * @returns {Promise<Object>}
   */
  async getPaymentOrderDetails(orderNumber) {
    try {
      const response = await api.get(`/payment-order/${orderNumber}/details`)
      return response.data
    } catch (error) {
      console.error(`Error fetching payment order details ${orderNumber}:`, error)
      throw error
    }
  },

  /**
   * Procesar reembolso
   */
  async refundPayment(paymentId) {
    try {
      const response = await api.post(`/payment-refund/${paymentId}`)
      return response.data
    } catch (error) {
      console.error(`Error refunding payment ${paymentId}:`, error)
      throw error
    }
  },

  /**
   * Validar datos de tarjeta de crédito (formato básico)
   */
  validateCardNumber(cardNumber) {
    // Luhn algorithm para validar números de tarjeta
    const digits = cardNumber.replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19) return false

    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10)

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  },

  /**
   * Validar fecha de expiración
   */
  validateExpiryDate(month, year) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const expYear = parseInt(year, 10)
    const expMonth = parseInt(month, 10)

    if (expYear < currentYear) return false
    if (expYear === currentYear && expMonth < currentMonth) return false

    return true
  },

  /**
   * Validar CVV
   */
  validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv)
  },

  /**
   * Formatos de proveedor para UI
   */
  getProviderInfo(provider) {
    const info = {
      mercado_pago: {
        name: 'Mercado Pago',
        icon: '💳',
        color: '#009EE3',
        description: 'Paga con Mercado Pago de forma segura'
      },
      paypal: {
        name: 'PayPal',
        icon: '🅿️',
        color: '#003087',
        description: 'Paga con tu cuenta de PayPal'
      },
      cash: {
        name: 'Efectivo',
        icon: '💵',
        color: '#10B981',
        description: 'Paga en efectivo en la taquilla'
      }
    }

    return info[provider] || {
      name: provider,
      icon: '💳',
      color: '#6B7280',
      description: 'Método de pago disponible'
    }
  }
}
