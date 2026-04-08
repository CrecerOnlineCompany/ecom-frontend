<template>
  <div class="movies-page">
    <div class="container">
      <h1>Películas</h1>

      <!-- Filters Section -->
      <div class="filters">
        <div class="filter-group">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por título..."
            class="search-input"
          >
        </div>

        <div class="filter-group">
          <select v-model="selectedGenre" class="filter-select">
            <option value="">Todos los géneros</option>
            <option value="Acción">Acción</option>
            <option value="Comedia">Comedia</option>
            <option value="Drama">Drama</option>
            <option value="Thriller">Thriller</option>
            <option value="Animación">Animación</option>
            <option value="Ciencia Ficción">Ciencia Ficción</option>
            <option value="Terror">Terror</option>
            <option value="Fantasía">Fantasía</option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="selectedCinema" class="filter-select">
            <option value="">Todos los cines</option>
            <option v-for="cinema in cinemas" :key="cinema.id" :value="cinema.id">
              {{ cinema.name }}
            </option>
          </select>
        </div>

        <button @click="resetFilters" class="btn btn-secondary">Limpiar Filtros</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Cargando películas...
      </div>

      <!-- Movies Grid -->
      <div v-else-if="filteredMovies.length > 0" class="movies-grid">
        <div 
          v-for="movie in filteredMovies" 
          :key="movie.id" 
          class="movie-card"
        >
          <div class="movie-poster">
            <img 
              :src="getMoviePoster(movie)" 
              :alt="movie.title"
              @error="handleImageError"
            >
            <div class="movie-overlay">
              <button class="btn btn-primary" @click="goToMovie(movie.id)">Ver Funciones</button>
            </div>
          </div>
          <div class="movie-info">
            <h3>{{ movie.title }}</h3>
            <p class="genre">{{ movie.genre }}</p>
            <p class="synopsis">{{ movie.synopsis || movie.description || '' }}</p>
            <div class="movie-meta">
              <span class="rating">⭐ {{ movie.rating || 'N/A' }}</span>
              <span class="duration">{{ movie.duration }} min</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="no-data">
        <p>No se encontraron películas con los filtros seleccionados</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { movieService, cinemaService } from '@/services/ticketService'
import { moviePosterPlaceholder } from '@/utils/placeholder'

const router = useRouter()
const route = useRoute()

const movies = ref([])
const cinemas = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedGenre = ref('')
const selectedCinema = ref('')

// Get initial filters from query params
onBeforeMount(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  if (route.query.cinema) {
    selectedCinema.value = route.query.cinema
  }
})

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    // Load movies
    const moviesData = await movieService.getAll()
    movies.value = Array.isArray(moviesData) ? moviesData : []

    // Load cinemas
    const cinemasData = await cinemaService.getAll()
    cinemas.value = Array.isArray(cinemasData) ? cinemasData : []
  } catch (error) {
    console.error('Error loading data:', error)
    movies.value = []
    cinemas.value = []
  } finally {
    loading.value = false
  }
}

const filteredMovies = computed(() => {
  return movies.value.filter(movie => {
    // Filter by search query
    if (searchQuery.value && !movie.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }

    // Filter by genre
    if (selectedGenre.value && movie.genre !== selectedGenre.value) {
      return false
    }

    return true
  })
})

const goToMovie = (movieId) => {
  router.push(`/movie/${movieId}`)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedGenre.value = ''
  selectedCinema.value = ''
  router.push('/movies')
}

const getMoviePoster = (movie) => {
  const rawUrl = (
    movie?.poster_image_url ||
    movie?.posterImageUrl ||
    movie?.poster_url ||
    movie?.posterUrl ||
    ''
  )

  if (typeof rawUrl !== 'string') return moviePosterPlaceholder
  const url = rawUrl.trim()
  if (!url) return moviePosterPlaceholder
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/')) return `${window.location.origin}${url}`
  return moviePosterPlaceholder
}

const handleImageError = (event) => {
  event.target.src = moviePosterPlaceholder
}
</script>

<style scoped>
.movies-page {
  padding: 2rem 0;
  min-height: 600px;
}

.movies-page h1 {
  margin-bottom: 2rem;
  color: var(--primary);
  font-size: 2.5rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #2d2d2d;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
}

.filter-group {
  display: flex;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  color: #fff;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

.search-input::placeholder {
  color: #666;
}

.filter-select option {
  background: #1a1a1a;
  color: #fff;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.movie-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.movie-poster {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 2/3;
  background: #2d2d2d;
  margin-bottom: 1rem;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.movie-info {
  padding: 0.5rem 0;
}

.movie-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.genre {
  color: var(--primary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.synopsis {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #999;
}

.loading,
.no-data {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.1rem;
}

@media (min-width: 1920px) {
  .movies-page h1 {
    font-size: 3rem;
    margin-bottom: 2.5rem;
  }

  .filters {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
    padding: 2rem;
    margin-bottom: 2.5rem;
  }

  .movies-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2.5rem;
    align-items: start;
  }

  .movie-info h3 {
    font-size: 1.3rem;
    line-height: 1.35;
  }

  .genre,
  .synopsis,
  .movie-meta {
    font-size: 1rem;
  }

  .movie-overlay .btn {
    min-height: 64px;
    font-size: 1.1rem;
    padding: 0 2rem;
  }
}

@media (min-width: 2560px) {
  .movies-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 3rem;
  }

  .movie-info h3 {
    font-size: 1.45rem;
  }

  .genre,
  .synopsis,
  .movie-meta {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .movies-page {
    padding: 1.5rem 0;
  }

  .movies-page h1 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .search-input,
  .filter-select {
    padding: 0.7rem;
    font-size: 0.95rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .movie-card:hover {
    transform: translateY(-4px);
  }

  .movie-overlay {
    opacity: 1;
    background: rgba(0, 0, 0, 0.85);
  }

  .movie-info h3 {
    font-size: 0.95rem;
    margin-bottom: 0.35rem;
  }

  .genre {
    font-size: 0.8rem;
    margin-bottom: 0.35rem;
  }

  .synopsis {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }

  .movie-meta {
    font-size: 0.75rem;
  }

  .btn {
    padding: 0.7rem 1.4rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .movies-page {
    padding: 1rem 0;
  }

  .movies-page h1 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: 0.6rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .search-input,
  .filter-select {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .movie-poster {
    margin-bottom: 0.75rem;
  }

  .movie-info {
    padding: 0.35rem 0;
  }

  .movie-info h3 {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }

  .genre {
    font-size: 0.7rem;
    margin-bottom: 0.25rem;
  }

  .synopsis {
    font-size: 0.65rem;
    margin-bottom: 0.35rem;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }

  .movie-meta {
    font-size: 0.65rem;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }

  .loading,
  .no-data {
    padding: 2rem 1rem;
    font-size: 0.95rem;
  }
}
</style>
