# 🎬 Cinea - Sistema de Configuración

## 📋 Resumen Rápido

Este proyecto cuenta con un **sistema de configuración centralizado** que te permite personalizar colores, características y comportamientos de la aplicación sin tocar el código de los componentes.

## 🚀 Inicio Rápido

### 1. Cambiar Colores

Edita `/src/config/appConfig.js`:

```javascript
colors: {
  primary: '#667eea',      // Cambia este color
  secondary: '#764ba2',    // Y este también
}
```

### 2. Configurar MovieCard

```javascript
features: {
  movieCard: {
    showStars: true,           // Mostrar estrellas
    showDescription: false,    // Ocultar descripción
    ratingFormat: 'both',      // 'stars', 'number', 'both'
  }
}
```

### 3. Ver los Cambios

Guarda el archivo y recarga la página. ¡Listo!

## 📁 Estructura de Archivos de Configuración

```
src/
├── config/
│   ├── appConfig.js           # ⭐ Configuración principal
│   └── themePresets.js        # Temas predefinidos
├── composables/
│   └── useAppConfig.js        # Hook para usar la config
├── plugins/
│   └── configPlugin.js        # Inyecta variables CSS
└── ...
```

## 🎨 Características Principales

### ✅ Configuración de Colores
- Colores primarios y secundarios
- Colores de estado (éxito, error, advertencia)
- Colores de texto y fondo
- Paleta de grises personalizable

### ✅ Configuración de MovieCard
```javascript
movieCard: {
  showStars: true,              // ⭐ Mostrar estrellas
  showDescription: false,       // 📝 Mostrar descripción
  showGenre: true,              // 🎭 Mostrar género
  showDuration: true,           // ⏱️ Mostrar duración
  showRating: true,             // 📊 Mostrar calificación
  showOverlay: true,            // 🎨 Overlay al hover
  showReleaseDate: false,       // 📅 Fecha de estreno
  
  ratingFormat: 'both',         // Formato: 'stars', 'number', 'both'
  maxStars: 5,                  // Máximo de estrellas
  
  hoverEffect: true,            // Efecto al pasar el mouse
  scaleOnHover: 1.05,          // Escala en hover
  translateYOnHover: -8,        // Movimiento vertical
}
```

### ✅ Otros Componentes Configurables
- **ScreeningCard**: Funciones de cine
- **Navbar**: Barra de navegación
- **Footer**: Pie de página
- **Cart**: Carrito de compras
- **Checkout**: Proceso de pago

## 📖 Ejemplos de Uso

### Ejemplo 1: Desactivar Descripciones

```javascript
// En appConfig.js
features: {
  movieCard: {
    showDescription: false,
  }
}
```

### Ejemplo 2: Cambiar Formato de Rating

```javascript
// Mostrar solo número (sin estrellas)
features: {
  movieCard: {
    ratingFormat: 'number',
    showStars: false,
  }
}
```

### Ejemplo 3: Desactivar Animaciones

```javascript
features: {
  movieCard: {
    hoverEffect: false,
    showOverlay: false,
  }
}
```

### Ejemplo 4: Usar un Tema Predefinido

```javascript
// En appConfig.js
import { themeNetflix } from './themePresets'

export const appConfig = {
  colors: themeNetflix.colors,
  // ... resto de configuración
}
```

## 🎭 Temas Disponibles

En `/src/config/themePresets.js` encontrarás:

- 🟣 **Original**: Púrpura/Azul (default)
- 🔴 **Netflix**: Rojo/Negro
- 🔵 **Blue Modern**: Azul moderno
- ⚫ **Dark Elegant**: Oscuro elegante
- 🟢 **Green Nature**: Verde naturaleza
- 🟠 **Orange Energetic**: Naranja energético

## 🛠️ Uso en Componentes

### Con Composable

```vue
<script setup>
import { useAppConfig } from '@/composables/useAppConfig'

const { config, colors, formatPrice } = useAppConfig()

// Usar configuración
const showStars = config.value.features.movieCard.showStars
const price = formatPrice(15.50)  // "S/ 15.50"
</script>
```

### Con Variables CSS

```vue
<style scoped>
.mi-elemento {
  color: var(--primary);
  background: var(--dark);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
}
</style>
```

## 📚 Documentación Completa

Lee la [Guía Completa de Configuración](./CONFIG_GUIDE.md) para:
- Lista completa de todas las opciones
- Ejemplos detallados
- Funciones helper disponibles
- Mejores prácticas

## 🎯 Variables CSS Disponibles

### Colores
- `--primary`, `--primary-dark`
- `--secondary`, `--accent`
- `--success`, `--warning`, `--danger`
- `--text-primary`, `--text-secondary`

### Estilos
- `--border-radius`, `--border-radius-sm`, `--border-radius-lg`
- `--shadow`, `--shadow-sm`, `--shadow-lg`, `--shadow-xl`
- `--transition`, `--transition-fast`, `--transition-slow`

## 💡 Tips Rápidos

1. ✅ Modifica solo `appConfig.js`, no los componentes
2. ✅ Usa variables CSS para estilos consistentes
3. ✅ Prueba diferentes temas con `themePresets.js`
4. ✅ Los cambios se aplican automáticamente al guardar

## 🔄 ¿Cómo Aplicar Cambios?

1. Edita `/src/config/appConfig.js`
2. Guarda el archivo
3. El navegador recarga automáticamente
4. ¡Listo! Los cambios están aplicados

## ⚙️ Configuración por Defecto

La configuración actual incluye:

- ✅ Estrellas activadas en rating
- ❌ Descripciones desactivadas
- ✅ Género visible
- ✅ Duración visible
- ✅ Efectos hover activados
- ✅ Overlay activado

## 🆘 ¿Necesitas Ayuda?

Consulta:
- [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - Guía detallada
- `/src/config/themePresets.js` - Temas predefinidos
- `/src/composables/useAppConfig.js` - Funciones disponibles

---

**Nota**: Este sistema de configuración está diseñado para ser simple y fácil de usar. No necesitas conocimientos avanzados de Vue.js para personalizarlo.
