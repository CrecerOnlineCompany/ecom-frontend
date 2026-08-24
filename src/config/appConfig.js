export const appConfig = {
  colors: {
    primary: '#111827',
    primaryDark: '#0b1220',
    secondary: '#374151',
    accent: '#111827',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    background: {
      dark: '#f6f6f7',
      gradient: {
        start: '#f6f6f7',
        end: '#f6f6f7',
      },
    },
    text: {
      primary: '#202223',
      secondary: '#4b5563',
      muted: '#6d7175',
    },
    gray: {
      light: '#f1f2f3',
      default: '#6d7175',
      dark: '#111827',
      darker: '#0b1220',
    },
  },

  styles: {
    borderRadius: '14px',
    borderRadiusSmall: '10px',
    borderRadiusLarge: '18px',
    shadow: {
      small: '0 2px 10px rgba(0, 0, 0, 0.06)',
      medium: '0 12px 30px rgba(0, 0, 0, 0.08)',
      large: '0 20px 55px rgba(0, 0, 0, 0.12)',
      xl: '0 30px 70px rgba(0, 0, 0, 0.14)',
    },
    transition: {
      fast: '0.12s ease',
      normal: '0.25s ease',
      slow: '0.5s ease',
      smooth: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    touch: {
      minTapSize: '48px',
      buttonPadding: '16px 28px',
      cardPadding: '18px',
      spacing: '18px',
      fontSize: {
        small: '16px',
        medium: '18px',
        large: '24px',
        xlarge: '32px',
      },
    },
  },

  app: {
    name: 'Ecom',
    version: '1.0.0',
    locale: 'es-AR',
    currency: 'ARS',
  },

  messages: {
    emptyCart: 'Tu carrito está vacío.',
    errorGeneric: 'Ocurrió un error. Por favor, intentá nuevamente.',
  },
}

export default appConfig
