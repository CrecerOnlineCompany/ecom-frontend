# ⚡ Guía Rápida de Configuración

## 🎯 Cambios Más Comunes

### 1. Cambiar el Color Principal

Archivo: `/src/config/appConfig.js`

```javascript
colors: {
  primary: '#TU_COLOR_AQUI',  // Ejemplo: '#e50914' para rojo Netflix
}
```

### 2. Activar/Desactivar Estrellas en Rating

```javascript
features: {
  movieCard: {
    showStars: true,        // true = muestra ⭐, false = solo número
    ratingFormat: 'stars',  // 'stars', 'number', 'both'
  }
}
```

### 3. Mostrar Descripción de Películas

```javascript
features: {
  movieCard: {
    showDescription: true,  // Cambiar a true para mostrar
  }
}
```

### 4. Desactivar Efectos de Hover

```javascript
features: {
  movieCard: {
    hoverEffect: false,     // Sin animación al pasar el mouse
    showOverlay: false,     // Sin overlay oscuro
  }
}
```

### 5. Cambiar Número de Estrellas

```javascript
features: {
  movieCard: {
    maxStars: 10,          // De 1 a 10 estrellas
    ratingFormat: 'stars',
  }
}
```

## 🎨 Temas Rápidos

### Tema Netflix (Rojo y Negro)

```javascript
colors: {
  primary: '#e50914',
  primaryDark: '#b20710',
  secondary: '#831010',
}
```

### Tema Azul Moderno

```javascript
colors: {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#06b6d4',
}
```

### Tema Verde

```javascript
colors: {
  primary: '#10b981',
  primaryDark: '#059669',
  secondary: '#14b8a6',
}
```

## 📊 Formatos de Rating

### Solo Estrellas
```javascript
showStars: true,
ratingFormat: 'stars',
```
**Resultado**: ⭐⭐⭐⭐

### Solo Número
```javascript
showStars: false,
ratingFormat: 'number',
```
**Resultado**: 8.5

### Ambos
```javascript
showStars: true,
ratingFormat: 'both',
```
**Resultado**: ⭐ 8.5

## 🔧 Configuración MovieCard Completa

### Minimalista (Menos Información)
```javascript
movieCard: {
  showStars: true,
  showDescription: false,
  showGenre: false,
  showDuration: false,
  showRating: true,
  showOverlay: true,
  showReleaseDate: false,
  ratingFormat: 'stars',
  hoverEffect: true,
}
```

### Detallada (Más Información)
```javascript
movieCard: {
  showStars: true,
  showDescription: true,
  showGenre: true,
  showDuration: true,
  showRating: true,
  showOverlay: true,
  showReleaseDate: true,
  ratingFormat: 'both',
  hoverEffect: true,
}
```

### Sin Animaciones
```javascript
movieCard: {
  showStars: true,
  showDescription: false,
  showGenre: true,
  showDuration: true,
  showRating: true,
  showOverlay: false,
  showReleaseDate: false,
  ratingFormat: 'both',
  hoverEffect: false,
}
```

## 🚀 ¿Cómo Aplicar?

1. Abre `/src/config/appConfig.js`
2. Busca la sección que quieres cambiar
3. Modifica los valores
4. Guarda el archivo (Ctrl+S)
5. ¡El navegador se actualiza automáticamente!

## 📝 Ejemplo Completo

```javascript
// En /src/config/appConfig.js

export const appConfig = {
  colors: {
    primary: '#e50914',        // Rojo Netflix
    secondary: '#831010',      // Rojo oscuro
    accent: '#ff0a16',         // Rojo brillante
  },
  
  features: {
    movieCard: {
      showStars: true,
      showDescription: true,   // Activar descripciones
      showGenre: true,
      showDuration: true,
      showRating: true,
      showOverlay: true,
      showReleaseDate: false,
      
      ratingFormat: 'both',    // Mostrar estrellas y número
      maxStars: 5,
      
      hoverEffect: true,
      scaleOnHover: 1.05,
      translateYOnHover: -8,
    }
  }
}
```

## 💡 Tips

- ✅ Cambia un valor a la vez para ver el efecto
- ✅ Usa colores en formato hexadecimal (#RRGGBB)
- ✅ Los valores true/false deben estar en minúsculas
- ✅ Los números no llevan comillas
- ✅ Los textos van entre comillas simples o dobles

## ⚠️ Errores Comunes

❌ **Mal**: `primary: red`  
✅ **Bien**: `primary: '#ff0000'`

❌ **Mal**: `showStars: True`  
✅ **Bien**: `showStars: true`

❌ **Mal**: `maxStars: '5'`  
✅ **Bien**: `maxStars: 5`

## 📚 Más Información

- **Guía Completa**: [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)
- **Temas Predefinidos**: [src/config/themePresets.js](./src/config/themePresets.js)
- **README**: [CONFIG_README.md](./CONFIG_README.md)

## 🧪 Ver Demo

Para ver una demo visual de la configuración, importa el componente `ConfigDemo`:

```vue
<template>
  <ConfigDemo />
</template>

<script setup>
import ConfigDemo from '@/components/ConfigDemo.vue'
</script>
```

---

**¿Dudas?** Consulta la documentación completa o revisa los archivos de ejemplo.
