/**
 * Configuración centralizada de la aplicación Cinelar
 * 
 * Este archivo contiene todas las configuraciones visuales y de características
 * que puedes modificar fácilmente sin tocar el código de los componentes.
 */

export const appConfig = {
  // ============================================
  // CONFIGURACIÓN DE COLORES
  // ============================================
  colors: {
    // Colores principales
    primary: '#b30707ff',           // Color principal (botones, enlaces, acentos)
    primaryDark: '#d35d55ff',       // Variante oscura del color principal
    secondary: '#e6702cff',         // Color secundario
    accent: '#f093fb',            // Color de acento
    
    // Colores de estado
    success: '#10b981',           // Verde para éxito
    warning: '#f59e0b',           // Naranja para advertencias
    danger: '#ef4444',            // Rojo para errores
    info: '#3b82f6',              // Azul para información

    // Colores de fondo
    background: {
      dark: '#000000ff',            // Fondo oscuro principal
      gradient: {
        start: 'rgba(0, 0, 0, 1)',         // Inicio del gradiente
        end: 'rgb(29, 1, 1)',           // Fin del gradiente
      },
    },
    
    // Colores de texto
    text: {
      primary: '#f1f5f9',         // Texto principal
      secondary: '#cbd5e1',       // Texto secundario
      muted: '#94a3b8',           // Texto deshabilitado
    },
    
    // Colores grises
    gray: {
      light: '#f8f9fa',
      default: '#94a3b8',
      dark: '#1e293b',
      darker: '#334155',
    },
  },

  // ============================================
  // CONFIGURACIÓN DE ESTILOS GENERALES
  // ============================================
  styles: {
    borderRadius: '16px',         // Radio de borde por defecto (aumentado para touch)
    borderRadiusSmall: '12px',    // Radio de borde pequeño
    borderRadiusLarge: '24px',    // Radio de borde grande
    
    // Sombras
    shadow: {
      small: '0 2px 4px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.24)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
      large: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 25px 50px rgba(0, 0, 0, 0.25)',
    },
    
    // Transiciones
    transition: {
      fast: '0.15s ease',
      normal: '0.3s ease',
      slow: '0.5s ease',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Configuración para pantallas táctiles (TOTEM)
    touch: {
      minTapSize: '48px',         // Tamaño mínimo recomendado para elementos táctiles
      buttonPadding: '18px 36px', // Padding generoso para botones
      cardPadding: '24px',        // Padding para cards
      spacing: '24px',            // Espaciado general entre elementos
      fontSize: {
        small: '16px',            // Fuente pequeña (legible en touch)
        medium: '18px',           // Fuente mediana
        large: '24px',            // Fuente grande para títulos
        xlarge: '32px',           // Fuente extra grande
      },
    },
  },

  // ============================================
  // CARACTERÍSTICAS DE COMPONENTES
  // ============================================
  features: {
    // Configuración de MovieCard
    movieCard: {
      showStars: true,              // Mostrar estrellas en el rating
      showDescription: false,       // Mostrar descripción de la película
      showGenre: true,              // Mostrar género
      showDuration: true,           // Mostrar duración
      showRating: true,             // Mostrar calificación
      showOverlay: true,            // Mostrar overlay al hacer hover
      showReleaseDate: false,       // Mostrar fecha de estreno
      
      // Formato de rating
      ratingFormat: 'stars',        // 'stars', 'number', 'both'
      maxStars: 5,                  // Número máximo de estrellas
      
      // Animaciones
      hoverEffect: true,            // Activar efecto hover
      scaleOnHover: 1.05,           // Escala al hacer hover (1 = sin escala)
      translateYOnHover: -8,        // Desplazamiento vertical en hover (en px)
      
      // Estilos
      aspectRatio: '2/3',           // Relación de aspecto del poster
      borderRadius: '8px',          // Radio de borde
    },

    // Configuración de ScreeningCard
    screeningCard: {
      showTheater: true,            // Mostrar nombre del cine
      showDate: true,               // Mostrar fecha
      showTime: true,               // Mostrar hora
      showAvailability: true,       // Mostrar disponibilidad de asientos
      showPrice: true,              // Mostrar precio
      compactMode: false,           // Modo compacto
    },

    // Configuración de Navbar
    navbar: {
      showLogo: true,               // Mostrar logo
      showSearch: false,            // Mostrar barra de búsqueda
      showUserMenu: true,           // Mostrar menú de usuario
      sticky: true,                 // Navbar fijo al hacer scroll
      transparent: false,           // Navbar transparente
    },

    // Configuración de Footer
    footer: {
      showSocialLinks: true,        // Mostrar enlaces sociales
      showNewsletter: false,        // Mostrar formulario de newsletter
      showCopyright: true,          // Mostrar copyright
    },

    // Configuración de Cart
    cart: {
      showThumbnails: true,         // Mostrar miniaturas de películas
      showRemoveButton: true,       // Mostrar botón de eliminar
      showContinueShopping: true,   // Mostrar botón continuar comprando
      autoOpenOnAdd: false,         // Abrir carrito automáticamente al agregar
    },

    // Configuración de Checkout
    checkout: {
      requirePhone: true,           // Requerir teléfono
      requireAddress: false,        // Requerir dirección
      showOrderSummary: true,       // Mostrar resumen de orden
      allowGuestCheckout: false,    // Permitir checkout sin registro
    },
  },

  // ============================================
  // CONFIGURACIÓN DE LA APLICACIÓN
  // ============================================
  app: {
    name: 'Cinelar',                  // Nombre de la aplicación
    version: '1.0.0',               // Versión
    logo: '/logo.png',              // Ruta del logo
    
    // Paginación
    itemsPerPage: 12,               // Items por página en listados
    
    // Imágenes
    defaultPosterUrl: '/placeholder-movie.png',  // Poster por defecto
    imageQuality: 'high',           // 'low', 'medium', 'high'
    
    // Formato de fecha y hora
    dateFormat: 'DD/MM/YYYY',       // Formato de fecha
    timeFormat: 'HH:mm',            // Formato de hora
    locale: 'es-ES',                // Idioma local
    
    // Moneda
    currency: 'PEN',                // Código de moneda (PEN = Sol Peruano)
    currencySymbol: 'S/',           // Símbolo de moneda
    
    // Validaciones
    minPasswordLength: 6,           // Longitud mínima de contraseña
    maxTicketsPerOrder: 10,         // Máximo de boletos por orden
  },

  // ============================================
  // MENSAJES Y TEXTOS
  // ============================================
  messages: {
    emptyCart: 'Tu carrito está vacío',
    noMoviesFound: 'No se encontraron películas',
    noScreeningsAvailable: 'No hay funciones disponibles',
    bookingSuccess: '¡Reserva realizada con éxito!',
    loginRequired: 'Debes iniciar sesión para continuar',
    errorGeneric: 'Ocurrió un error. Por favor, intenta nuevamente.',
  },
}

// Función helper para obtener colores con opacidad
export const getColorWithOpacity = (color, opacity) => {
  // Si el color está en formato hex
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return color
}

// Función para obtener el estilo del rating según la configuración
export const getRatingDisplay = (rating) => {
  const { ratingFormat, maxStars } = appConfig.features.movieCard
  
  if (!rating) return 'N/A'
  
  switch (ratingFormat) {
    case 'stars':
      return '⭐'.repeat(Math.round((rating / 10) * maxStars))
    case 'number':
      return rating.toFixed(1)
    case 'both':
      return `⭐ ${rating.toFixed(1)}`
    default:
      return `⭐ ${rating.toFixed(1)}`
  }
}

export default appConfig
