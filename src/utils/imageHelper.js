/**
 * Helper para construir URLs completas de imágenes
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const BASE_URL = API_BASE_URL.replace('/api', '')

/**
 * Obtiene la URL completa de una imagen
 * @param {string} path - Ruta de la imagen (puede ser relativa o absoluta)
 * @param {string} fallback - Imagen de respaldo
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (path, fallback = null) => {
  // Si no hay path, retornar fallback
  if (!path) {
    return fallback || 'https://via.placeholder.com/300x450?text=Sin+Imagen'
  }

  // Si ya es una URL completa (http/https), retornarla tal cual
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Si es una ruta relativa que empieza con /, construir URL completa
  if (path.startsWith('/')) {
    return `${BASE_URL}${path}`
  }

  // Si es una ruta relativa sin /, agregar /storage/
  return `${BASE_URL}/storage/${path}`
}

/**
 * Obtiene la URL del poster de una película
 * @param {object} movie - Objeto de la película
 * @returns {string} URL del poster
 */
export const getMoviePosterUrl = (movie) => {
  if (!movie) return 'https://via.placeholder.com/300x450?text=Sin+Imagen'
  
  const fallback = `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || 'Película')}`
  return getImageUrl(movie.poster_url, fallback)
}
