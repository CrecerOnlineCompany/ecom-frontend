import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useTicketValidator() {
  const router = useRouter()
  const route = useRoute()
  
  const ticketData = ref(null)
  const qrCodes = ref([])
  const thermalFormat = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const validateTicket = async (ticketId) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/validate`)
      
      if (!response.ok) {
        throw new Error('Ticket inválido o no encontrado')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Error validando ticket')
      }
      
      ticketData.value = data.ticket
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loadTicketDetails = async (ticketId) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/details`)
      
      if (!response.ok) {
        throw new Error('Error cargando detalles del ticket')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message)
      }
      
      ticketData.value = data.ticket
      return data.ticket
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  const loadQRCodes = async (ticketId) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/qr`)
      
      if (!response.ok) {
        throw new Error('Error cargando QR codes')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message)
      }
      
      qrCodes.value = data.seats
      return data.seats
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  const loadThermalFormat = async (ticketId) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/print-thermal`)
      
      if (!response.ok) {
        throw new Error('Error cargando formato de impresión')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message)
      }
      
      thermalFormat.value = data.print_format
      return data.print_format
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  const printTicket = async (ticketId) => {
    try {
      const format = await loadThermalFormat(ticketId)
      
      if (!format) {
        throw new Error('No se pudo obtener el formato de impresión')
      }
      
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      
      document.body.appendChild(iframe)
      
      const doc = iframe.contentDocument || iframe.contentWindow.document
      doc.write(format.html)
      doc.close()
      
      setTimeout(() => {
        iframe.contentWindow.print()
        document.body.removeChild(iframe)
      }, 500)
      
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  return {
    ticketData,
    qrCodes,
    thermalFormat,
    isLoading,
    error,
    validateTicket,
    loadTicketDetails,
    loadQRCodes,
    loadThermalFormat,
    printTicket
  }
}
