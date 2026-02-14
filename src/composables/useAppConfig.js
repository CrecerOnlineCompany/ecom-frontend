/**
 * Composable para acceder a la configuración de la aplicación
 * 
 * Uso en componentes:
 * import { useAppConfig } from '@/composables/useAppConfig'
 * 
 * const { config, colors, features } = useAppConfig()
 */

import { computed } from 'vue'
import appConfig, { getColorWithOpacity, getRatingDisplay } from '@/config/appConfig'

export function useAppConfig() {
  // Acceso directo a la configuración completa
  const config = computed(() => appConfig)
  
  // Acceso directo a colores
  const colors = computed(() => appConfig.colors)
  
  // Acceso directo a características
  const features = computed(() => appConfig.features)
  
  // Acceso directo a estilos
  const styles = computed(() => appConfig.styles)
  
  // Acceso directo a configuración de app
  const app = computed(() => appConfig.app)
  
  // Acceso directo a mensajes
  const messages = computed(() => appConfig.messages)
  
  // Función para obtener un color con opacidad
  const getColor = (color, opacity = 1) => {
    if (opacity === 1) return color
    return getColorWithOpacity(color, opacity)
  }
  
  // Función para formatear rating según configuración
  const formatRating = (rating) => {
    return getRatingDisplay(rating)
  }
  
  // Función para formatear precio
  const formatPrice = (price) => {
    const { currencySymbol } = appConfig.app
    return `${currencySymbol} ${parseFloat(price).toFixed(2)}`
  }
  
  // Función para formatear fecha
  const formatDate = (date) => {
    const { locale, dateFormat } = appConfig.app
    const d = new Date(date)
    return d.toLocaleDateString(locale)
  }
  
  // Función para formatear hora
  const formatTime = (time) => {
    if (!time) return ''
    // Asume que time viene en formato HH:mm:ss o HH:mm
    return time.substring(0, 5)
  }
  
  // Función para obtener placeholder de imagen
  const getImagePlaceholder = () => {
    return appConfig.app.defaultPosterUrl
  }
  
  // Función para verificar si una característica está habilitada
  const isFeatureEnabled = (component, feature) => {
    return appConfig.features[component]?.[feature] ?? false
  }
  
  return {
    config,
    colors,
    features,
    styles,
    app,
    messages,
    getColor,
    formatRating,
    formatPrice,
    formatDate,
    formatTime,
    getImagePlaceholder,
    isFeatureEnabled,
  }
}

export default useAppConfig
