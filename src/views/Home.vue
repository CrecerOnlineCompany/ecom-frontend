<template>
  <div class="home">


    <!-- Featured Section -->
    <section class="section">
      <div class="container">
        <h2>Películas Destacadas</h2>
        
        <div v-if="loading" class="loading">
          Cargando películas...
        </div>

        <div v-else-if="movies.length > 0" class="movies-grid">
          <div v-for="movie in featuredMovies" :key="movie.id" class="movie-card">
            <div class="movie-poster">
              <img 
                :src=" movie.poster_image_url || movie.poster_url || moviePosterPlaceholder" 
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
              <div class="movie-meta">
                <span class="rating">⭐ {{ movie.rating || 'N/A' }}</span>
                <span class="duration">{{ movie.duration }} min</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          No hay películas disponibles
        </div>
      </div>
    </section>



    <!-- Call to Action -->
    <section class="section cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>¿Listo para disfrutar del cine?</h2>
          <p>Explora nuestras películas actuales y reserva tus entradas ahora</p>
          <div class="cta-buttons">
            <RouterLink to="/movies" class="btn btn-primary">Ver Todas las Películas</RouterLink>
            <button @click="scrollToSection('cinema-section')" class="btn btn-secondary">Encontrar Cine</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { movieService, cinemaService } from '@/services/ticketService'
import { moviePosterPlaceholder } from '@/utils/placeholder'

const router = useRouter()
const movies = ref([])
const cinemas = ref([])
const loading = ref(false)

const featuredMovies = computed(() => movies.value.slice(0, 6))

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

const goToMovie = (movieId) => {
  router.push(`/movie/${movieId}`)
}

const selectCinema = (cinemaId) => {
  router.push(`/movies?cinema=${cinemaId}`)
}

const scrollToSection = (sectionClass) => {
  const element = document.querySelector(`.${sectionClass}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleImageError = (event) => {
  event.target.src = moviePosterPlaceholder
}
</script>

<style scoped>
.hero {
  position: relative;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 3rem;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 600px;
  padding: 2rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-search {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.hero-search input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 1rem;
  font-size: 1rem;
  outline: none;
  color: #333;
}

.hero-search input::placeholder {
  color: #999;
}

.section {
  padding: 3rem 0;
  border-bottom: 1px solid #3d3d3d;
}

.section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--primary);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
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
  border-radius: var(--border-radius);
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
  margin-bottom: 0.75rem;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #999;
}

.cinemas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.cinema-card {
  background: #2d2d2d;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border: 1px solid #3d3d3d;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cinema-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.cinema-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.cinema-header h3 {
  color: var(--primary);
  margin: 0;
}

.cinema-badge {
  background: rgba(102, 126, 234, 0.2);
  color: var(--primary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.cinema-details {
  margin-bottom: 1.5rem;
  color: #ccc;
}

.cinema-details p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.cinema-details strong {
  color: var(--primary);
}

.cta-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-bottom: 1px solid #3d3d3d;
}

.cta-content {
  text-align: center;
}

.cta-content h2 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 1.1rem;
}

@media (min-width: 1920px) {
  .section {
    padding: 4rem 0;
  }

  .section h2 {
    font-size: 2.4rem;
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
  .movie-meta {
    font-size: 1rem;
  }

  .movie-overlay .btn {
    min-height: 64px;
    font-size: 1.1rem;
    padding: 0 2rem;
  }

  .cta-content h2 {
    font-size: 2.8rem;
  }

  .cta-content p {
    font-size: 1.25rem;
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
  .movie-meta {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 280px;
    margin-bottom: 2rem;
  }

  .hero-content {
    padding: 1.5rem;
  }

  .hero h1 {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
  }

  .hero p {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .hero-search {
    flex-direction: column;
    padding: 0.4rem;
  }

  .hero-search input {
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .section {
    padding: 2rem 0;
  }

  .section h2 {
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1.2rem;
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
  }

  .genre {
    font-size: 0.8rem;
  }

  .movie-meta {
    font-size: 0.75rem;
  }

  .cinemas-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .cinema-card {
    padding: 1.25rem;
  }

  .cinema-header {
    margin-bottom: 0.75rem;
  }

  .cinema-details p {
    font-size: 0.9rem;
    margin: 0.35rem 0;
  }

  .cta-content h2 {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
  }

  .cta-content p {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 220px;
    margin-bottom: 1.5rem;
  }

  .hero-content {
    padding: 1rem;
  }

  .hero h1 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }

  .hero p {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }

  .hero-search input {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .section {
    padding: 1.5rem 0;
  }

  .section h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.8rem;
  }

  .movie-info h3 {
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
  }

  .genre {
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }

  .movie-meta {
    font-size: 0.65rem;
    gap: 0.5rem;
  }

  .cinemas-grid {
    gap: 1rem;
  }

  .cinema-card {
    padding: 1rem;
  }

  .cinema-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .cinema-header h3 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .cinema-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }

  .cinema-details p {
    font-size: 0.8rem;
    margin: 0.25rem 0;
  }

  .cta-content h2 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }

  .cta-content p {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>
