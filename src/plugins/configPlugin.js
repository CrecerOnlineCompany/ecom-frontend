/**
 * Plugin para inyectar las variables CSS desde la configuración
 * Esto permite que los cambios en appConfig.js se reflejen automáticamente en los estilos
 */

import appConfig from '@/config/appConfig'

export function injectCSSVariables() {
  const root = document.documentElement
  const { colors, styles } = appConfig
  
  // Inyectar colores
  root.style.setProperty('--primary', colors.primary)
  root.style.setProperty('--primary-dark', colors.primaryDark)
  root.style.setProperty('--secondary', colors.secondary)
  root.style.setProperty('--accent', colors.accent)
  root.style.setProperty('--success', colors.success)
  root.style.setProperty('--warning', colors.warning)
  root.style.setProperty('--danger', colors.danger)
  root.style.setProperty('--info', colors.info)
  
  // Colores de fondo
  root.style.setProperty('--dark', colors.background.dark)
  root.style.setProperty('--bg-gradient-start', colors.background.gradient.start)
  root.style.setProperty('--bg-gradient-end', colors.background.gradient.end)
  
  // Colores de texto
  root.style.setProperty('--text-primary', colors.text.primary)
  root.style.setProperty('--text-secondary', colors.text.secondary)
  root.style.setProperty('--text-muted', colors.text.muted)
  
  // Grises
  root.style.setProperty('--gray', colors.gray.default)
  root.style.setProperty('--gray-light', colors.gray.light)
  root.style.setProperty('--gray-dark', colors.gray.dark)
  root.style.setProperty('--gray-darker', colors.gray.darker)
  
  // Estilos
  root.style.setProperty('--border-radius', styles.borderRadius)
  root.style.setProperty('--border-radius-sm', styles.borderRadiusSmall)
  root.style.setProperty('--border-radius-lg', styles.borderRadiusLarge)
  
  // Sombras
  root.style.setProperty('--shadow', styles.shadow.medium)
  root.style.setProperty('--shadow-sm', styles.shadow.small)
  root.style.setProperty('--shadow-lg', styles.shadow.large)
  root.style.setProperty('--shadow-xl', styles.shadow.xl)
  
  // Transiciones
  root.style.setProperty('--transition', styles.transition.smooth)
  root.style.setProperty('--transition-fast', styles.transition.fast)
  root.style.setProperty('--transition-slow', styles.transition.slow)
  
  // Variables para touch screens
  if (styles.touch) {
    root.style.setProperty('--touch-min-tap-size', styles.touch.minTapSize)
    root.style.setProperty('--touch-button-padding', styles.touch.buttonPadding)
    root.style.setProperty('--touch-card-padding', styles.touch.cardPadding)
    root.style.setProperty('--touch-spacing', styles.touch.spacing)
    root.style.setProperty('--touch-font-sm', styles.touch.fontSize.small)
    root.style.setProperty('--touch-font-md', styles.touch.fontSize.medium)
    root.style.setProperty('--touch-font-lg', styles.touch.fontSize.large)
    root.style.setProperty('--touch-font-xl', styles.touch.fontSize.xlarge)
  }
}

export default {
  install: (app) => {
    // Inyectar variables CSS cuando la app se monta
    injectCSSVariables()
    
    // Hacer la configuración accesible globalmente
    app.config.globalProperties.$config = appConfig
  }
}
