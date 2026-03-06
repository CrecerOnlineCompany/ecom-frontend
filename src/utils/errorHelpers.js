/**
 * Procesar mensaje de error para mostrar un mensaje más amigable al usuario
 * Especialmente para errores de asientos vendidos/ocupados
 *
 * @param {string} errorMessage - Mensaje de error del servidor
 * @returns {string} - Mensaje procesado y amigable
 */
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

  // Detectar otros errores comunes y mejorar mensajes
  if (errorMessage.includes('not found') || errorMessage.includes('no encontrado')) {
    return 'Los datos solicitados no fueron encontrados. Por favor, intenta de nuevo.'
  }

  if (errorMessage.includes('unauthorized') || errorMessage.includes('autenticación')) {
    return 'Autenticación requerida. Por favor, inicia sesión de nuevo.'
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('tiempo')) {
    return 'La solicitud tardó demasiado. Por favor, intenta de nuevo.'
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
