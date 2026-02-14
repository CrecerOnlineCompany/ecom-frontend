/**
 * Servicio de debugging para pruebas de API
 * Úsalo en la consola del navegador para debugear la conexión con la API
 */

import api from './api'

export const debugService = {
  /**
   * Probar conexión con el endpoint de proveedores de pago
   */
  async testPaymentProviders() {
    console.log('🔍 Probando endpoint /api/payment-providers...')
    console.log('URL:', api.defaults.baseURL + '/payment-providers')
    
    try {
      const response = await api.get('/payment-providers')
      console.log('✅ Respuesta exitosa:', response)
      console.log('Status:', response.status)
      console.log('Data:', response.data)
      console.log('Headers:', response.headers)
      return response.data
    } catch (error) {
      console.error('❌ Error en la solicitud:', error)
      if (error.response) {
        console.error('Status:', error.response.status)
        console.error('Data:', error.response.data)
        console.error('Headers:', error.response.headers)
      }
      throw error
    }
  },

  /**
   * Probar autenticación
   */
  async testAuth() {
    console.log('🔍 Probando token de autenticación...')
    const token = localStorage.getItem('auth_token')
    console.log('Token en localStorage:', token ? 'Sí' : 'No')
    
    if (token) {
      console.log('Token:', token.substring(0, 20) + '...')
      console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`)
    }
    
    return token
  },

  /**
   * Probar la configuración de la API
   */
  getApiConfig() {
    console.log('🔧 Configuración de la API:')
    console.log('Base URL:', api.defaults.baseURL)
    console.log('Timeout:', api.defaults.timeout)
    console.log('Headers:', api.defaults.headers)
    return api.defaults
  },

  /**
   * Hacer una solicitud GET manual
   */
  async manualGet(endpoint) {
    console.log(`🔍 GET ${endpoint}`)
    try {
      const response = await api.get(endpoint)
      console.log('Respuesta:', response.data)
      return response.data
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  },

  /**
   * Hacer una solicitud POST manual
   */
  async manualPost(endpoint, data) {
    console.log(`🔍 POST ${endpoint}`, data)
    try {
      const response = await api.post(endpoint, data)
      console.log('Respuesta:', response.data)
      return response.data
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  }
}

// Exponer globalmente en desarrollo
if (import.meta.env.DEV) {
  window.debugService = debugService
  console.log('💡 debugService disponible como window.debugService')
  console.log('Usa: debugService.testPaymentProviders()')
}
