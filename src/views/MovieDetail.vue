<template>
  <div class="movie-detail">
    <div v-if="loading" class="loading">
      Cargando película...
    </div>

    <div v-else-if="movie" class="detail-container">
      <!-- Back Button -->
      <router-link to="/movies" class="back-link">
        ← Volver a películas
      </router-link>

      <!-- Movie Header -->
      <div class="movie-header">
        <div class="movie-poster">
          <img 
            :src=" movie.poster_image_url || movie.poster_url || moviePosterPlaceholder" 
            :alt="movie.title"
            @error="handleImageError"
          >
        </div>

        <div class="movie-content">
          <h1>{{ movie.title }}</h1>
          
          <div class="movie-metadata">
            <div class="meta-item">
              <span class="meta-label">Género:</span>
              <span>{{ movie.genre }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Duración:</span>
              <span>{{ movie.duration }} minutos</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Director:</span>
              <span>{{ movie.director || 'No especificado' }}</span>
            </div>
          </div>

          <!-- Available Dates Selector -->
          <div v-if="groupedScreenings.length > 0" class="available-dates">
            <h3>Funciones disponibles:</h3>
            <div class="dates-selector">
              <div 
                v-for="dateGroup in groupedScreenings" 
                :key="dateGroup.date"
                class="date-card"
              >
                <div class="date-header-card">
                  <span class="date-day">{{ getDateDay(dateGroup.date) }}</span>
                  <span class="date-label">{{ getDateLabel(dateGroup.date) }}</span>
                </div>
                <div class="screenings-preview">
                  <button 
                    v-for="screening in dateGroup.screenings.slice(0, 2)"
                    :key="screening.id"
                    class="screening-preview-btn"
                    @click="goToBooking(screening.id)"
                  >
                    <div class="preview-time">{{ formatTime(screening.start_time) }}</div>
                    <div class="preview-format" v-if="screening.format">{{ screening.format }}</div>
                    <div class="preview-room"> {{ screening.room.name }}</div>
                  </button>
                  <button 
                    v-if="dateGroup.screenings.length > 2"
                    class="screening-preview-btn more-btn"
                    @click="scrollToDate(dateGroup.date)"
                  >
                    <div class="preview-more">+{{ dateGroup.screenings.length - 2 }} más</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="synopsis">
            <h3>Sinopsis</h3>
            <p>{{ movie.synopsis }}</p>
          </div>
        </div>
      </div>

      <!-- Screenings Section -->
      <section class="screenings-section">
        <h2>Funciones Disponibles</h2>

        <div v-if="screeningsLoading" class="loading">
          Cargando funciones...
        </div>

        <div v-else-if="groupedScreenings.length > 0">
          <!-- Group by date -->
          <div v-for="dateGroup in groupedScreenings" :key="dateGroup.date" class="date-group" :data-date="dateGroup.date">
            <h3 class="date-header">{{ formatDate(dateGroup.date) }}</h3>
            
            <div class="screenings-grid">
              <div 
                v-for="screening in dateGroup.screenings" 
                :key="screening.id"
                class="screening-card"
                @click="goToBooking(screening.id)"
              >
                <div class="cinema-name">{{ screening.cinema_name }}</div>
                <div class="room-name">Sala {{ screening.room_number }}</div>
                <div class="time">{{ formatTime(screening.start_time) }}</div>
                <div class="available-seats">
                  {{ screening.available_seats }} asientos
                </div>
                <button class="btn btn-primary">
                  Comprar Entrada
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          No hay funciones disponibles para esta película
        </div>
      </section>
    </div>

    <div v-else class="no-data">
      Película no encontrada
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { movieService, screeningService } from '@/services/ticketService'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { moviePosterPlaceholder } from '@/utils/placeholder'
import { appConfig } from './../config/appConfig'

const router = useRouter()
const route = useRoute()

const movie = ref(null)
const screenings = ref([])
const loading = ref(true)
const screeningsLoading = ref(false)

onMounted(async () => {
  await loadMovie()
})

const loadMovie = async () => {
  try {
    const movieId = route.params.id
    const movieData = await movieService.getById(movieId)
    movie.value = movieData

    await loadScreenings()
  } catch (error) {
    console.error('Error loading movie:', error)
  } finally {
    loading.value = false
  }
}

const loadScreenings = async () => {
  screeningsLoading.value = true
  try {
    const movieId = route.params.id
    const screeningsData = await screeningService.getByMovie(movieId)
    screenings.value = Array.isArray(screeningsData) ? screeningsData : []
  } catch (error) {
    console.error('Error loading screenings:', error)
    screenings.value = []
  } finally {
    screeningsLoading.value = false
  }
}

const groupedScreenings = computed(() => {
  const groups = {}
  
  screenings.value.forEach(screening => {
    const date = screening.start_time.split(' ')[0]
    if (!groups[date]) {
      groups[date] = {
        date,
        screenings: []
      }
    }
    groups[date].screenings.push(screening)
  })

  // Sort by date
  return Object.values(groups).sort((a, b) => new Date(a.date) - new Date(b.date))
})

const formatDate = (dateString) => {
  try {
    const date = parseISO(dateString)
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateString
  }
}

const formatTime = (dateTimeString) => {
  try {
    const date = parseISO(dateTimeString)
    return format(date, 'HH:mm')
  } catch {
    return dateTimeString.split(' ')[1]
  }
}

const goToBooking = (screeningId) => {
  router.push(`/booking/${screeningId}`)
}

const handleImageError = (event) => {
  event.target.src = moviePosterPlaceholder
}

const getDateDay = (dateString) => {
  try {
    const date = parseISO(dateString)
    return format(date, 'dd')
  } catch {
    return dateString
  }
}

const getDateLabel = (dateString) => {
  try {
    const date = parseISO(dateString)
    return format(date, "EEE, d MMM", { locale: es })
  } catch {
    return dateString
  }
}

const scrollToDate = (dateString) => {
  const element = document.querySelector(`[data-date="${dateString}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.movie-detail {
  padding: 2rem 0;
  min-height: 600px;
}

.back-link {
  display: inline-block;
  margin-bottom: 2rem;
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #fff;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.movie-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(90deg, v-bind("appConfig.colors.background.gradient.start") 0%, v-bind("appConfig.colors.background.gradient.end") 100%);
  border-radius: 8px;
  border: 1px solid #3d3d3d;
}

.movie-poster {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 2/3;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-content h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--primary);
}

.movie-metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.meta-item span:last-child {
  color: #ccc;
}

.synopsis {
  margin-top: 2rem;
}

.synopsis h3 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.synopsis p {
  color: #ccc;
  line-height: 1.6;
}

.available-dates {
  background: transparent;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  margin: 2rem 0;
}

.available-dates h3 {
  color: var(--primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.dates-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.date-card {
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.date-card:hover {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.date-header-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.date-day {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.date-label {
  font-size: 0.75rem;
  color: #999;
  text-transform: capitalize;
}

.screenings-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.screening-preview-btn {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.4);
  color: #fff;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 0.85rem;
}

.screening-preview-btn:hover {
  background: var(--primary);
  color: #000;
  border-color: var(--primary);
  transform: scale(1.05);
}

.preview-time {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary);
}

.screening-preview-btn:hover .preview-time {
  color: #000;
}

.preview-format {
  font-size: 0.65rem;
  background: rgba(102, 126, 234, 0.3);
  color: var(--primary);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.screening-preview-btn:hover .preview-format {
  background: rgba(0, 0, 0, 0.2);
  color: #000;
}

.preview-room {
  font-size: 0.75rem;
  color: #999;
  letter-spacing: 0.5px;
}

.screening-preview-btn:hover .preview-room {
  color: rgba(0, 0, 0, 0.7);
}

.more-btn {
  background: rgba(102, 126, 234, 0.15);
  border: 1px dashed rgba(102, 126, 234, 0.5);
}

.more-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
}

.preview-more {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
}

.more-btn:hover .preview-more {
  color: #000;
}

.screenings-section {
  margin-top: 3rem;
}

.screenings-section h2 {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 2rem;
}

.date-group {
  margin-bottom: 2rem;
}

.date-header {
  color: var(--primary);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  text-transform: capitalize;
}

.screenings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.screening-card {
  background: #2d2d2d;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.screening-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  border-color: var(--primary);
}

.cinema-name {
  color: var(--primary);
  font-weight: 600;
  font-size: 1.1rem;
}

.room-name {
  color: #999;
  font-size: 0.9rem;
}

.time {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.available-seats {
  color: #ccc;
  font-size: 0.9rem;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .movie-detail {
    padding: 1rem 0;
  }

  .detail-container {
    padding: 0 0.75rem;
  }

  .back-link {
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .movie-header {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .movie-poster {
    max-width: 200px;
    margin: 0 auto;
  }

  .movie-content h1 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .movie-metadata {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .meta-item {
    gap: 0.25rem;
  }

  .meta-label {
    font-size: 0.9rem;
  }

  .synopsis {
    margin-top: 1.5rem;
  }

  .synopsis h3 {
    font-size: 1rem;
  }

  .synopsis p {
    font-size: 0.9rem;
  }

  .screenings-section {
    margin-top: 2rem;
  }

  .screenings-section h2 {
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
  }

  .screenings-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .screening-card {
    padding: 1.2rem;
    gap: 0.75rem;
  }

  .date-group {
    margin-bottom: 1.5rem;
  }

  .date-header {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }

  .dates-selector {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }

  .date-card {
    padding: 0.85rem;
  }

  .date-header-card {
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .date-day {
    font-size: 1.4rem;
  }

  .date-label {
    font-size: 0.65rem;
  }

  .screenings-preview {
    gap: 0.4rem;
  }

  .screening-preview-btn {
    padding: 0.6rem;
    gap: 0.2rem;
  }

  .preview-time {
    font-size: 1rem;
  }

  .preview-format {
    font-size: 0.6rem;
  }

  .preview-room {
    font-size: 0.65rem;
  }

  .more-btn {
    padding: 0.6rem;
  }

  .preview-more {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .movie-detail {
    padding: 0.5rem 0;
  }

  .detail-container {
    padding: 0 0.5rem;
  }

  .back-link {
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }

  .movie-header {
    gap: 1rem;
    padding: 1rem;
    border-radius: 6px;
  }

  .movie-poster {
    max-width: 180px;
  }

  .movie-content h1 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .movie-metadata {
    gap: 0.75rem;
  }

  .meta-label {
    font-size: 0.8rem;
  }

  .meta-item span:last-child {
    font-size: 0.85rem;
  }

  .available-dates {
    padding: 1rem;
    margin: 1.5rem 0;
  }

  .available-dates h3 {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }

  .dates-selector {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 0.5rem;
  }

  .date-card {
    padding: 0.7rem;
  }

  .date-header-card {
    margin-bottom: 0.6rem;
    padding-bottom: 0.6rem;
  }

  .date-day {
    font-size: 1.2rem;
  }

  .date-label {
    font-size: 0.6rem;
  }

  .screenings-preview {
    gap: 0.35rem;
  }

  .screening-preview-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .preview-time {
    font-size: 0.9rem;
  }

  .preview-format {
    font-size: 0.55rem;
    padding: 0.15rem 0.3rem;
  }

  .preview-room {
    font-size: 0.6rem;
  }

  .screenings-section h2 {
    font-size: 1.2rem;
  }

  .screening-card {
    padding: 1rem;
    gap: 0.6rem;
  }

  .cinema-name {
    font-size: 0.95rem;
  }

  .room-name {
    font-size: 0.8rem;
  }

  .time {
    font-size: 1.2rem;
  }

  .available-seats {
    font-size: 0.8rem;
  }

  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
