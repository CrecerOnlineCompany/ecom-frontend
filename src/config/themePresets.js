/**
 * TEMAS PREDEFINIDOS PARA CINEA
 * 
 * Este archivo contiene diferentes configuraciones de tema que puedes
 * copiar y pegar en appConfig.js para cambiar rápidamente el estilo
 * de tu aplicación.
 */

// ============================================
// TEMA ORIGINAL (Púrpura/Azul)
// ============================================
export const themeOriginal = {
  colors: {
    primary: '#667eea',
    primaryDark: '#5568d3',
    secondary: '#764ba2',
    accent: '#f093fb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  }
}

// ============================================
// TEMA NETFLIX (Rojo/Negro)
// ============================================
export const themeNetflix = {
  colors: {
    primary: '#e50914',
    primaryDark: '#b20710',
    secondary: '#831010',
    accent: '#ff0a16',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#dc2626',
    info: '#3b82f6',
    background: {
      dark: '#141414',
      gradient: {
        start: '#000000',
        end: '#1a1a1a',
      },
    },
  }
}

// ============================================
// TEMA AZUL MODERNO
// ============================================
export const themeBlueModern = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
  }
}

// ============================================
// TEMA OSCURO ELEGANTE
// ============================================
export const themeDarkElegant = {
  colors: {
    primary: '#c084fc',
    primaryDark: '#a855f7',
    secondary: '#f472b6',
    accent: '#fb7185',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    background: {
      dark: '#18181b',
      gradient: {
        start: '#09090b',
        end: '#27272a',
      },
    },
  }
}

// ============================================
// TEMA VERDE NATURALEZA
// ============================================
export const themeGreenNature = {
  colors: {
    primary: '#10b981',
    primaryDark: '#059669',
    secondary: '#14b8a6',
    accent: '#6ee7b7',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  }
}

// ============================================
// TEMA NARANJA ENERGÉTICO
// ============================================
export const themeOrangeEnergetic = {
  colors: {
    primary: '#f97316',
    primaryDark: '#ea580c',
    secondary: '#fb923c',
    accent: '#fdba74',
    success: '#10b981',
    warning: '#fbbf24',
    danger: '#dc2626',
    info: '#3b82f6',
  }
}

// ============================================
// CONFIGURACIONES DE CARACTERÍSTICAS
// ============================================

// Configuración Minimalista (menos información)
export const featuresMinimal = {
  movieCard: {
    showStars: true,
    showDescription: false,
    showGenre: false,
    showDuration: false,
    showRating: true,
    showOverlay: true,
    showReleaseDate: false,
    ratingFormat: 'stars',
    maxStars: 5,
    hoverEffect: true,
    scaleOnHover: 1.03,
    translateYOnHover: -5,
    aspectRatio: '2/3',
    borderRadius: '12px',
  }
}

// Configuración Detallada (más información)
export const featuresDetailed = {
  movieCard: {
    showStars: true,
    showDescription: true,
    showGenre: true,
    showDuration: true,
    showRating: true,
    showOverlay: true,
    showReleaseDate: true,
    ratingFormat: 'both',
    maxStars: 5,
    hoverEffect: true,
    scaleOnHover: 1.05,
    translateYOnHover: -8,
    aspectRatio: '2/3',
    borderRadius: '8px',
  }
}

// Configuración Sin Animaciones
export const featuresNoAnimations = {
  movieCard: {
    showStars: true,
    showDescription: false,
    showGenre: true,
    showDuration: true,
    showRating: true,
    showOverlay: false,
    showReleaseDate: false,
    ratingFormat: 'both',
    maxStars: 5,
    hoverEffect: false,
    scaleOnHover: 1,
    translateYOnHover: 0,
    aspectRatio: '2/3',
    borderRadius: '8px',
  }
}

// Configuración Estilo IMDb
export const featuresIMDb = {
  movieCard: {
    showStars: false,
    showDescription: true,
    showGenre: true,
    showDuration: true,
    showRating: true,
    showOverlay: true,
    showReleaseDate: true,
    ratingFormat: 'number',  // Solo número como IMDb
    maxStars: 5,
    hoverEffect: true,
    scaleOnHover: 1.02,
    translateYOnHover: -4,
    aspectRatio: '2/3',
    borderRadius: '4px',
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

// Para usar un tema, copia el código del tema que quieras
// y pégalo en /src/config/appConfig.js

// Ejemplo 1: Cambiar solo los colores
/*
import { themeNetflix } from './themePresets'

export const appConfig = {
  colors: themeNetflix.colors,
  // ... resto de la configuración
}
*/

// Ejemplo 2: Cambiar colores y características
/*
import { themeBlueModern, featuresDetailed } from './themePresets'

export const appConfig = {
  colors: themeBlueModern.colors,
  features: {
    movieCard: featuresDetailed.movieCard,
    // ... resto de características
  }
}
*/

// Ejemplo 3: Mezclar configuraciones
/*
export const appConfig = {
  colors: {
    primary: '#667eea',      // Del tema original
    secondary: '#e50914',    // Del tema Netflix
    // ... otros colores personalizados
  }
}
*/
