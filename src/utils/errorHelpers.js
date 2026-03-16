/**
 * Procesar mensaje de error para mostrar un mensaje más amigable al usuario
 * Especialmente para errores de asientos vendidos/ocupados
 *
 * @param {string} errorMessage - Mensaje de error del servidor
 * @returns {string} - Mensaje procesado y amigable
 */
export const PAYMENT_ERROR_RULES = [
  {
    id: 'not_found',
    test: (message) => /not found|no encontrado/i.test(message),
    message: 'Los datos solicitados no fueron encontrados. Por favor, intenta de nuevo.'
  },
  {
    id: 'unauthorized',
    test: (message) => /unauthorized|autenticaci/i.test(message),
    message: 'Autenticación requerida. Por favor, inicia sesión de nuevo.'
  },
  {
    id: 'timeout',
    test: (message) => /timeout|tiempo/i.test(message),
    message: 'La solicitud tardó demasiado. Por favor, intenta de nuevo.'
  },
  {
    id: 'network',
    test: (message) => /network|conexi|ECONN|fetch/i.test(message),
    message: 'No se pudo conectar con el proveedor. Vuelve a intentar o prueba con otro método de pago.'
  }
]

const parseMercadoPagoError = (errorMessage) => {
  if (!errorMessage || !errorMessage.includes('API de Mercado Pago:')) {
    return null
  }

  const [, payload] = errorMessage.split('API de Mercado Pago:')
  if (!payload) return null

  try {
    const parsed = JSON.parse(payload.trim())
    const error = Array.isArray(parsed?.errors) ? parsed.errors[0] : null
    return error || null
  } catch (e) {
    console.warn('Error parsing Mercado Pago error payload:', e)
    return null
  }
}

export function processPaymentErrorMessage(errorMessage) {
  if (!errorMessage) {
    return 'Error al procesar el pago. Intenta de nuevo.'
  }

  // Detectar error de asientos reservados/vendidos
  if (errorMessage.includes('Seat reservation failed')) {
    try {
      // Extraer el objeto JSON del mensaje de error
      const match = errorMessage.match(/\{[^}]+\}/)
      if (match) {
        const soldSeats = JSON.parse(match[0])
        const seatNumbers = Object.keys(soldSeats)
          .sort()
          .join(', ')
        return `Los asientos ${seatNumbers} que intentas comprar están ya ocupados. Por favor, elige otros asientos.`
      }
    } catch (e) {
      console.warn('Error parsing seat reservation error:', e)
      // Si no se puede parsear, usar mensaje genérico
      return 'Los asientos que intentas comprar están ya ocupados. Por favor, elige otros asientos.'
    }
  }

  // Errores específicos de Mercado Pago
  const mpError = parseMercadoPagoError(errorMessage)
  if (mpError) {
    const detailsText = Array.isArray(mpError.details) ? mpError.details.join(' ') : ''
    if (detailsText.includes('terminal_id')) {
      return 'Vuelve a intentar o prueba con otro método de pago.'
    }
    if (mpError.code === 'property_value') {
      return 'Vuelve a intentar o prueba con otro método de pago.'
    }
    return 'No se pudo iniciar el pago con Mercado Pago. Vuelve a intentar o prueba con otro método de pago.'
  }

  // Detectar otros errores comunes y mejorar mensajes
  const matchedRule = PAYMENT_ERROR_RULES.find(rule => rule.test(errorMessage))
  if (matchedRule) {
    return matchedRule.message
  }

  // Retornar el mensaje original si no coincide con patrones conocidos
  return errorMessage
}

/**
 * Extraer números de asientos de un error de reserva fallida
 *
 * @param {string} errorMessage - Mensaje de error del servidor
 * @returns {string[]} - Array con números de asientos
 */
export function extractSoldSeatNumbers(errorMessage) {
  if (!errorMessage || !errorMessage.includes('Seat reservation failed')) {
    return []
  }

  try {
    const match = errorMessage.match(/\{[^}]+\}/)
    if (match) {
      const soldSeats = JSON.parse(match[0])
      return Object.keys(soldSeats).sort()
    }
  } catch (e) {
    console.warn('Error extracting sold seats:', e)
  }

  return []
}
