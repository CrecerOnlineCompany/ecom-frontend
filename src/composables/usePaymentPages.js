/**
 * Helper para integración de páginas de pago
 * Facilita la redirección y gestión de estados de pago
 */

import { useRouter } from 'vue-router'
import { printService } from '@/services/printService'

export function usePaymentPages() {
  const router = useRouter()

  /**
   * Redirige a página de pago exitoso
   * @param {string} ticketNumber - Número del ticket
   * @param {Object} ticketData - Datos adicionales del ticket (opcional)
   * @param {boolean} autoPrint - Auto-imprimir al llegar (opcional)
   */
  const goToSuccess = async (ticketNumber, ticketData = null, autoPrint = false) => {
    try {
      // Guardar datos del ticket en localStorage si se proporcionan
      if (ticketData) {
        const storedTickets = localStorage.getItem('tickets')
        const tickets = storedTickets ? JSON.parse(storedTickets) : []
        
        const newTicket = {
          ticketNumber,
          ...ticketData
        }
        
        tickets.push(newTicket)
        localStorage.setItem('tickets', JSON.stringify(tickets))
      }

      // Redirigir a página de éxito
      await router.push({
        name: 'PaymentSuccess',
        query: { 
          ticket: ticketNumber,
          autoPrint: autoPrint ? 'true' : 'false'
        }
      })

      // Auto-imprimir si se solicita
      if (autoPrint && ticketData) {
        setTimeout(() => {
          printService.printThermalTicket({
            ticketNumber,
            movieTitle: ticketData.movieTitle || 'N/A',
            screeningDate: ticketData.screeningDate || 'N/A',
            screeningTime: ticketData.screeningTime || 'N/A',
            seatNumber: ticketData.seatNumber || 'N/A',
            price: ticketData.price || '0.00'
          })
        }, 500)
      }
    } catch (error) {
      console.error('Error al ir a página de éxito:', error)
    }
  }

  /**
   * Redirige a página de pago fallido
   * @param {string} reference - Código de referencia del error
   * @param {string} errorCode - Código del error (insufficient_funds, etc.)
   * @param {string} errorMessage - Mensaje personalizado (opcional)
   */
  const goToFailed = async (reference, errorCode = 'unknown_error', errorMessage = null) => {
    try {
      const validErrorCodes = [
        'insufficient_funds',
        'card_declined',
        'expired_card',
        'invalid_cvv',
        'network_error',
        'gateway_timeout',
        'authentication_failed',
        'duplicate_transaction',
        'unknown_error'
      ]

      const finalErrorCode = validErrorCodes.includes(errorCode) 
        ? errorCode 
        : 'unknown_error'

      await router.push({
        name: 'PaymentFailed',
        query: {
          ticket: reference,
          error: finalErrorCode,
          ...(errorMessage && { message: errorMessage })
        }
      })
    } catch (error) {
      console.error('Error al ir a página de fallo:', error)
    }
  }

  /**
   * Obtiene el estado del último pago desde query params
   * @returns {Object} { status, ticket, error }
   */
  const getPaymentStatus = () => {
    return {
      status: 'pending',
      ticket: null,
      error: null
    }
  }

  /**
   * Limpia el estado del pago de localStorage
   */
  const clearPaymentState = () => {
    localStorage.removeItem('payment_state')
    localStorage.removeItem('pending_ticket')
  }

  return {
    goToSuccess,
    goToFailed,
    getPaymentStatus,
    clearPaymentState
  }
}
