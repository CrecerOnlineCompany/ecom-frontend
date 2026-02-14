/**
 * Genera un placeholder SVG con texto
 * @param {number} width - Ancho de la imagen
 * @param {number} height - Alto de la imagen
 * @param {string} text - Texto a mostrar
 * @returns {string} Data URL del SVG
 */
export const getPlaceholder = (width = 300, height = 450, text = 'Sin Imagen') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        fill="#666"
      >${text}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Placeholder para poster de película
 */
export const moviePosterPlaceholder = getPlaceholder(300, 450, 'Imagen no disponible')

/**
 * Placeholder pequeño
 */
export const smallPlaceholder = getPlaceholder(100, 150, 'Sin imagen')
