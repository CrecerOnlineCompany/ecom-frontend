import QRCode from 'qrcode'
import api from './api'

class PaymentMethodService {
  constructor() {
    this.api = api
  }

  /**
   * Obtener todos los métodos de pago disponibles
   */
  async getMethods() {
    try {
      const response = await this.api.get('/payment-methods')
      return response.data
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      throw error
    }
  }

  /**
   * Obtener proveedores para un método específico
   */
  async getMethodProviders(method) {
    try {
      const response = await this.api.get(`/payment-methods/${method}/providers`)
      return response.data
    } catch (error) {
      console.error(`Error fetching providers for method ${method}:`, error)
      throw error
    }
  }

  /**
   * Procesar pago QR
   */
  async processQrPayment(paymentData) {
    try {
      const response = await this.api.post('/payment-process-qr', {
        payment_provider_id: paymentData.payment_provider_id,
        screening_id: paymentData.screening_id,
        seat_ids: paymentData.seat_ids,
        order_number: paymentData.order_number,
        idempotency_key: paymentData.idempotency_key,
        customer_email: paymentData.customer_email,
        customer_name: paymentData.customer_name
      })

      if (response?.data?.success === false) {
        const backendError = new Error(response.data.message || 'No se pudo iniciar el pago QR')
        backendError.code = response.data.error_code || 'PAYMENT_ERROR'
        backendError.backend = response.data
        throw backendError
      }
      
      // Normalizar response
      return {
        success: response.data.success,
        order_id: response.data.order_id,
        order_number: response.data.order_number,
        reserved_until: response.data.reserved_until,
        payment_ticket_id: response.data.payment_ticket_id,
        idempotency_key: response.data.idempotency_key,
        qr_data: response.data.qr_data || response.data.qr_code,
        error_code: response.data.error_code,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error processing QR payment:', error)
      throw error
    }
  }

  /**
   * Procesar pago con Terminal Smart
   */
  async processTerminalPayment(paymentData) {
    try {
      const response = await this.api.post('/payment-process-terminal', {
        payment_provider_id: paymentData.payment_provider_id,
        screening_id: paymentData.screening_id,
        seat_ids: paymentData.seat_ids,
        order_number: paymentData.order_number,
        idempotency_key: paymentData.idempotency_key,
        customer_email: paymentData.customer_email,
        customer_name: paymentData.customer_name
      })

      if (response?.data?.success === false) {
        const backendError = new Error(response.data.message || 'No se pudo iniciar el pago en terminal')
        backendError.code = response.data.error_code || 'PAYMENT_ERROR'
        backendError.backend = response.data
        throw backendError
      }
      
      // Normalizar response
      return {
        success: response.data.success,
        order_id: response.data.order_id,
        order_number: response.data.order_number,
        reserved_until: response.data.reserved_until,
        payment_ticket_id: response.data.payment_ticket_id,
        idempotency_key: response.data.idempotency_key,
        error_code: response.data.error_code,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error processing terminal payment:', error)
      throw error
    }
  }

  /**
   * Generar código QR visual usando qrcode.js
   */
  async generateQRCode(data, elementId) {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`)
      }

      // Limpiar elemento anterior
      element.innerHTML = ''

      // Generar QR
      await QRCode.toCanvas(element, JSON.stringify(data), {
        errorCorrectionLevel: 'H',
        type: 'image/webp',
        quality: 0.95,
        margin: 1,
        width: 250,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      return true
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw error
    }
  }

  /**
   * Monitorear estado de pago (QR o Terminal)
   * Endpoint único para ambos métodos según el nuevo flujo
   */
  async monitorPayment(paymentTicketId) {
    try {
      const response = await this.api.get(`/payment-status/${paymentTicketId}`)
      return response.data
    } catch (error) {
      console.error('Error monitoring payment status:', error)
      throw error
    }
  }

  /**
   * Verificación manual de pago desde popup de orden activa.
   * Este endpoint puede forzar consulta al proveedor (ej: Mercado Pago).
   */
  async manualCheckPayment(paymentContext = {}) {
    try {
      const response = await this.api.post('/payment-status/manual-check', {
        payment_ticket_id: paymentContext.payment_ticket_id,
        order_number: paymentContext.order_number,
        order_id: paymentContext.order_id,
        payment_provider_id: paymentContext.payment_provider_id
      })
      return response.data
    } catch (error) {
      console.error('Error in manual payment check:', error)
      throw error
    }
  }

  /**
   * Descargar código QR como imagen
   */
  async downloadQRCode(elementId, filename = 'qrcode.png') {
    try {
      const canvas = document.getElementById(elementId)?.querySelector('canvas')
      if (!canvas) {
        throw new Error('QR Canvas not found')
      }

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return true
    } catch (error) {
      console.error('Error downloading QR code:', error)
      throw error
    }
  }

  /**
   * Obtener información del proveedor
   */
  getProviderInfo(providerName) {
    const providerMap = {
      'mercado_pago': {
        name: 'Mercado Pago',
        icon: '🔐',
        color: '#009ee3',
        methods: ['redirect', 'qr', 'terminal']
      },
      'stripe': {
        name: 'Stripe',
        icon: '💳',
        color: '#635BFF',
        methods: ['redirect', 'card']
      },
      'paypal': {
        name: 'PayPal',
        icon: '🅿️',
        color: '#0070BA',
        methods: ['redirect']
      }
    }

    return providerMap[providerName] || {
      name: providerName,
      icon: '💰',
      color: '#666',
      methods: []
    }
  }

  /**
   * Obtener información del método de pago
   */
  getMethodInfo(methodType) {
    const methodMap = {
      'redirect': {
        label: 'Redirección Segura',
        icon: '🔐',
        description: 'Serás redirigido al procesador de pagos para completar la transacción seguramente.',
        badge: 'SEGURO'
      },
      'qr': {
        label: 'Código QR',
        icon: '📱',
        description: 'Escanea el código QR con tu teléfono para pagar rápidamente.',
        badge: 'RÁPIDO'
      },
      'terminal': {
        label: 'Terminal Smart',
        icon: '🏪',
        description: 'Acerca tu tarjeta a la terminal para pagar al instante.',
        badge: 'PRESENCIAL'
      },
      'manual': {
        label: 'Transferencia',
        icon: '🏦',
        description: 'Realiza una transferencia bancaria manual.',
        badge: 'MANUAL'
      }
    }

    return methodMap[methodType] || {
      label: methodType,
      icon: '💰',
      description: 'Método de pago',
      badge: 'OTRO'
    }
  }

  /**
   * Cancelar pago pendiente
   */
  async cancelPayment(paymentTicketId) {
    try {
      const response = await this.api.post(`/payment-cancel/${paymentTicketId}`)
      return response.data
    } catch (error) {
      console.error('Error cancelling payment:', error)
      throw error
    }
  }

  /**
   * Cancelar orden pendiente por numero de orden
   */
  async cancelOrderByNumber(orderNumber, providerId) {
    try {
      const payload = {
        order_number: orderNumber
      }
      if (providerId !== undefined && providerId !== null) {
        payload.payment_provider_id = providerId
      }

      const response = await this.api.post('/payment-cancel', payload)
      return response.data
    } catch (error) {
      console.error('Error cancelling order by number:', error)
      throw error
    }
  }

  /**
   * Validar sesión de pago
   */
  async validatePaymentSession(screeningId, seatIds) {
    try {
      const response = await this.api.post('/validate-payment-session', {
        screening_id: screeningId,
        seat_ids: seatIds
      })
      return response.data
    } catch (error) {
      console.error('Error validating payment session:', error)
      throw error
    }
  }
}

// Exportar instancia singleton
export const paymentMethodService = new PaymentMethodService()
export default PaymentMethodService
