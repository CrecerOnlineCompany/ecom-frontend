/**
 * EJEMPLO DE INTEGRACIÓN EN CHECKOUT.VUE
 * 
 * Este archivo muestra cómo integrar las páginas de pago exitoso/fallido
 * con el componente Checkout existente.
 * 
 * INSTRUCCIONES:
 * 1. Copia el código del composable en tu Checkout.vue
 * 2. Importa usePaymentPages
 * 3. Usa en tu lógica de pago
 */

// ============================================
// OPCIÓN 1: Usando el composable usePaymentPages
// ============================================

// En tu Checkout.vue:

/*
<script setup>
import { ref } from 'vue'
import { usePaymentPages } from '@/composables/usePaymentPages'

const { goToSuccess, goToFailed } = usePaymentPages()

const procesarPago = async (datosFormulario) => {
  try {
    // Llamar al servicio de pago
    const respuesta = await paymentService.processPayment(datosFormulario)

    if (respuesta.success) {
      // Pago exitoso - redirigir a página de success
      await goToSuccess(
        respuesta.ticketNumber,
        {
          movieTitle: 'Avatar 3',
          screeningDate: '21/01/2026',
          screeningTime: '20:00',
          seatNumber: 'A1',
          price: '10.00'
        },
        true // auto-imprimir
      )
    } else {
      // Pago fallido - redirigir a página de failed
      await goToFailed(
        respuesta.referenceCode,
        respuesta.errorCode, // 'insufficient_funds', 'card_declined', etc.
        respuesta.errorMessage
      )
    }
  } catch (error) {
    console.error('Error al procesar pago:', error)
    await goToFailed(
      `ERR-${Date.now()}`,
      'unknown_error'
    )
  }
}
</script>
*/

// ============================================
// OPCIÓN 2: Redirección manual directa
// ============================================

/*
import { useRouter } from 'vue-router'

const router = useRouter()

const procesarPago = async (datosFormulario) => {
  try {
    const respuesta = await paymentService.processPayment(datosFormulario)

    if (respuesta.success) {
      // Éxito
      router.push({
        path: '/payment-success',
        query: { ticket: respuesta.ticketNumber }
      })
    } else {
      // Fallo
      router.push({
        path: '/payment-failed',
        query: {
          ticket: respuesta.referenceCode,
          error: respuesta.errorCode
        }
      })
    }
  } catch (error) {
    router.push('/payment-failed')
  }
}
*/

// ============================================
// OPCIÓN 3: Con almacenamiento de datos completos
// ============================================

/*
const procesarPago = async (datosFormulario) => {
  try {
    const respuesta = await paymentService.processPayment(datosFormulario)

    // Guardar datos del ticket en localStorage
    const ticketData = {
      ticketNumber: respuesta.ticketNumber,
      movieTitle: datosFormulario.pelicula,
      screeningDate: datosFormulario.fecha,
      screeningTime: datosFormulario.hora,
      seatNumber: datosFormulario.asiento,
      price: datosFormulario.precio,
      paymentMethod: datosFormulario.metodoPago,
      transactionId: respuesta.transactionId
    }

    // Agregar a lista de tickets
    const storedTickets = localStorage.getItem('tickets')
    const tickets = storedTickets ? JSON.parse(storedTickets) : []
    tickets.push(ticketData)
    localStorage.setItem('tickets', JSON.stringify(tickets))

    // Redirigir
    if (respuesta.success) {
      router.push({
        path: '/payment-success',
        query: { ticket: respuesta.ticketNumber }
      })
    } else {
      router.push({
        path: '/payment-failed',
        query: {
          ticket: respuesta.referenceCode,
          error: respuesta.errorCode
        }
      })
    }
  } catch (error) {
    router.push('/payment-failed')
  }
}
*/

// ============================================
// ESTRUCTURA DE RESPUESTA ESPERADA DEL BACKEND
// ============================================

/*
// ÉXITO:
{
  success: true,
  ticketNumber: 'TICKET-2026-001',
  transactionId: 'TXN123456',
  amount: 10.00,
  currency: 'EUR',
  timestamp: '2026-01-21T20:00:00Z'
}

// FALLO:
{
  success: false,
  referenceCode: 'ERR-20260121-001',
  errorCode: 'insufficient_funds', // insufficient_funds, card_declined, etc.
  errorMessage: 'Tu cuenta no tiene fondos suficientes',
  timestamp: '2026-01-21T20:00:00Z'
}
*/

// ============================================
// CÓDIGOS DE ERROR DISPONIBLES
// ============================================

const ERROR_CODES = {
  INSUFFICIENT_FUNDS: 'insufficient_funds',      // Fondos insuficientes
  CARD_DECLINED: 'card_declined',                // Tarjeta rechazada
  EXPIRED_CARD: 'expired_card',                  // Tarjeta expirada
  INVALID_CVV: 'invalid_cvv',                    // CVV inválido
  NETWORK_ERROR: 'network_error',                // Error de red
  GATEWAY_TIMEOUT: 'gateway_timeout',            // Timeout del gateway
  AUTHENTICATION_FAILED: 'authentication_failed', // Autenticación fallida
  DUPLICATE_TRANSACTION: 'duplicate_transaction', // Transacción duplicada
  UNKNOWN_ERROR: 'unknown_error'                 // Error desconocido
}

// ============================================
// EJEMPLO COMPLETO CON SIMULACIÓN
// ============================================

/*
// Para propósitos de prueba, aquí hay una función simulada:

const simulatePaymentProcessing = async (paymentData) => {
  // Simular delay de procesamiento
  return new Promise((resolve) => {
    setTimeout(() => {
      // 70% de probabilidad de éxito
      const isSuccess = Math.random() > 0.3

      if (isSuccess) {
        resolve({
          success: true,
          ticketNumber: `TICKET-${Date.now()}`,
          transactionId: `TXN-${Date.now()}`,
          amount: paymentData.amount,
          currency: 'EUR'
        })
      } else {
        // Elegir error aleatorio
        const errors = [
          'insufficient_funds',
          'card_declined',
          'network_error'
        ]
        const randomError = errors[Math.floor(Math.random() * errors.length)]

        resolve({
          success: false,
          referenceCode: `ERR-${Date.now()}`,
          errorCode: randomError,
          errorMessage: `Error de pago: ${randomError}`
        })
      }
    }, 2000) // Simular 2 segundos de procesamiento
  })
}
*/

// ============================================
// INTEGRACIÓN CON SERVICIO DE IMPRESIÓN
// ============================================

/*
import { printService } from '@/services/printService'

const procesarPago = async (datosFormulario) => {
  try {
    const respuesta = await paymentService.processPayment(datosFormulario)

    if (respuesta.success) {
      const ticketData = {
        ticketNumber: respuesta.ticketNumber,
        movieTitle: datosFormulario.pelicula,
        screeningDate: datosFormulario.fecha,
        screeningTime: datosFormulario.hora,
        seatNumber: datosFormulario.asiento,
        price: datosFormulario.precio
      }

      // Guardar datos
      const storedTickets = localStorage.getItem('tickets')
      const tickets = storedTickets ? JSON.parse(storedTickets) : []
      tickets.push(ticketData)
      localStorage.setItem('tickets', JSON.stringify(tickets))

      // Redirigir
      await router.push({
        path: '/payment-success',
        query: { ticket: respuesta.ticketNumber }
      })

      // Esperar a que se cargue la página y luego imprimir
      setTimeout(async () => {
        await printService.printThermalTicket(ticketData)
      }, 1000)
    } else {
      await router.push({
        path: '/payment-failed',
        query: {
          ticket: respuesta.referenceCode,
          error: respuesta.errorCode
        }
      })
    }
  } catch (error) {
    console.error('Error:', error)
    await router.push('/payment-failed')
  }
}
*/

export const paymentIntegrationExample = {
  ERROR_CODES
}
