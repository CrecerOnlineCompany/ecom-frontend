# 🎨 Sistema de Configuración de Cinea

Este documento explica cómo usar y personalizar el sistema de configuración centralizado de la aplicación Cinea.

## 📁 Archivos Principales

- **`/src/config/appConfig.js`**: Archivo principal de configuración
- **`/src/composables/useAppConfig.js`**: Composable para usar la configuración en componentes
- **`/src/plugins/configPlugin.js`**: Plugin que inyecta las variables CSS

## 🎨 Configuración de Colores

Para cambiar los colores de la aplicación, edita el archivo `/src/config/appConfig.js`:

```javascript
colors: {
  primary: '#667eea',           // Color principal
  primaryDark: '#5568d3',       // Variante oscura
  secondary: '#764ba2',         // Color secundario
  accent: '#f093fb',            // Color de acento
  // ... más colores
}
```

### Colores Disponibles

| Color | Uso | Por Defecto |
|-------|-----|-------------|
| `primary` | Botones, enlaces, acentos | #667eea |
| `primaryDark` | Variante oscura del primario | #5568d3 |
| `secondary` | Color secundario | #764ba2 |
| `accent` | Color de acento | #f093fb |
| `success` | Mensajes de éxito | #10b981 |
| `warning` | Advertencias | #f59e0b |
| `danger` | Errores | #ef4444 |
| `info` | Información | #3b82f6 |

## ✨ Configuración de Características

### MovieCard

Configura cómo se muestran las tarjetas de películas:

```javascript
features: {
  movieCard: {
    showStars: true,              // Mostrar estrellas en el rating
    showDescription: false,       // Mostrar descripción
    showGenre: true,              // Mostrar género
    showDuration: true,           // Mostrar duración
    showRating: true,             // Mostrar calificación
    showOverlay: true,            // Mostrar overlay al hover
    showReleaseDate: false,       // Mostrar fecha de estreno
    
    ratingFormat: 'stars',        // 'stars', 'number', 'both'
    maxStars: 5,                  // Número máximo de estrellas
    
    hoverEffect: true,            // Activar efecto hover
    scaleOnHover: 1.05,           // Escala al hacer hover
    translateYOnHover: -8,        // Desplazamiento vertical
    
    aspectRatio: '2/3',           // Relación de aspecto
    borderRadius: '8px',          // Radio de borde
  }
}
```

#### Ejemplos de Uso

**Mostrar solo estrellas sin número:**
```javascript
showStars: true,
ratingFormat: 'stars',
```

**Mostrar solo el número:**
```javascript
showStars: false,
ratingFormat: 'number',
```

**Mostrar estrellas y número:**
```javascript
showStars: true,
ratingFormat: 'both',
```

**Desactivar efecto hover:**
```javascript
hoverEffect: false,
```

**Cambiar el número de estrellas:**
```javascript
maxStars: 10,  // Mostrará hasta 10 estrellas
```

### ScreeningCard

Configura las tarjetas de funciones:

```javascript
screeningCard: {
  showTheater: true,            // Mostrar nombre del cine
  showDate: true,               // Mostrar fecha
  showTime: true,               // Mostrar hora
  showAvailability: true,       // Mostrar disponibilidad
  showPrice: true,              // Mostrar precio
  compactMode: false,           // Modo compacto
}
```

### Navbar

```javascript
navbar: {
  showLogo: true,               // Mostrar logo
  showSearch: false,            // Mostrar búsqueda
  showUserMenu: true,           // Mostrar menú de usuario
  sticky: true,                 // Navbar fijo
  transparent: false,           // Navbar transparente
}
```

### Otros Componentes

- **Footer**: Configuración del pie de página
- **Cart**: Configuración del carrito
- **Checkout**: Configuración del proceso de compra

## 🔧 Uso en Componentes

### Usando el Composable

```vue
<script setup>
import { useAppConfig } from '@/composables/useAppConfig'

const { config, colors, features, formatPrice, formatRating } = useAppConfig()

// Acceder a configuración
const showStars = config.value.features.movieCard.showStars
const primaryColor = colors.value.primary

// Usar funciones helper
const price = formatPrice(15.50)  // "S/ 15.50"
const rating = formatRating(8.5)  // "⭐ 8.5"
</script>
```

### Usando Variables CSS

Las variables CSS se inyectan automáticamente y están disponibles en todos los componentes:

```vue
<style scoped>
.my-element {
  color: var(--primary);
  background: var(--dark);
  border-radius: var(--border-radius);
  transition: var(--transition);
  box-shadow: var(--shadow-lg);
}
</style>
```

### Variables CSS Disponibles

**Colores:**
- `--primary`, `--primary-dark`
- `--secondary`, `--accent`
- `--success`, `--warning`, `--danger`, `--info`
- `--dark`, `--gray`, `--gray-light`, `--gray-dark`
- `--text-primary`, `--text-secondary`, `--text-muted`

**Estilos:**
- `--border-radius`, `--border-radius-sm`, `--border-radius-lg`
- `--shadow`, `--shadow-sm`, `--shadow-lg`, `--shadow-xl`
- `--transition`, `--transition-fast`, `--transition-slow`

## 📝 Ejemplos Prácticos

### Cambiar Colores del Tema

Para cambiar a un tema azul:

```javascript
colors: {
  primary: '#3b82f6',           // Azul
  primaryDark: '#2563eb',       // Azul oscuro
  secondary: '#06b6d4',         // Cyan
  accent: '#8b5cf6',            // Púrpura
}
```

### Desactivar Descripciones en MovieCard

```javascript
features: {
  movieCard: {
    showDescription: false,
  }
}
```

### Mostrar Fecha de Estreno

```javascript
features: {
  movieCard: {
    showReleaseDate: true,
  }
}
```

### Cambiar Formato de Rating

```javascript
features: {
  movieCard: {
    ratingFormat: 'number',      // Solo número sin estrellas
    showStars: false,
  }
}
```

### Desactivar Efectos Hover

```javascript
features: {
  movieCard: {
    hoverEffect: false,
    showOverlay: false,
  }
}
```

## 🎯 Funciones Helper

### formatPrice(price)
Formatea un precio según la moneda configurada.
```javascript
formatPrice(15.50)  // "S/ 15.50"
```

### formatRating(rating)
Formatea el rating según la configuración.
```javascript
formatRating(8.5)  // "⭐ 8.5" o "⭐⭐⭐⭐" según ratingFormat
```

### formatDate(date)
Formatea una fecha según el locale configurado.
```javascript
formatDate('2024-12-17')  // "17/12/2024"
```

### formatTime(time)
Formatea una hora.
```javascript
formatTime('14:30:00')  // "14:30"
```

### isFeatureEnabled(component, feature)
Verifica si una característica está habilitada.
```javascript
isFeatureEnabled('movieCard', 'showStars')  // true o false
```

## 🚀 Tips y Mejores Prácticas

1. **Centraliza las configuraciones**: Modifica solo el archivo `appConfig.js`, no los componentes individuales.

2. **Usa variables CSS**: Aprovecha las variables CSS para estilos consistentes.

3. **Prueba los cambios**: Después de modificar la configuración, revisa que todo funcione correctamente.

4. **Documenta cambios**: Si modificas valores por defecto, documenta el por qué.

5. **Mantén consistencia**: Usa colores y estilos de la configuración en lugar de valores hardcodeados.

## 🔄 Aplicar Cambios

Los cambios en `appConfig.js` se aplican automáticamente cuando:
1. Guardas el archivo
2. El servidor de desarrollo recarga la página

No necesitas reiniciar el servidor de desarrollo.

## ⚠️ Notas Importantes

- Los cambios en la configuración afectan a toda la aplicación
- Algunos componentes pueden requerir actualización manual para usar todas las características
- Mantén los valores de configuración dentro de rangos razonables
- Prueba la aplicación en diferentes dispositivos después de cambiar configuraciones visuales

## 📚 Recursos Adicionales

- Ver ejemplos completos en los componentes actualizados
- Consultar `useAppConfig.js` para todas las funciones disponibles
- Revisar `configPlugin.js` para entender cómo se inyectan las variables CSS

---

¿Necesitas ayuda? Consulta los archivos de ejemplo o contacta al equipo de desarrollo.
