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
          <div class="available-dates">
            <h3>Funciones disponibles:</h3>
            <div v-if="screeningsLoading" class="loading">
              Cargando funciones...
            </div>

            <div v-else-if="groupedScreenings.length > 0">
              <div v-for="dateGroup in groupedScreenings" :key="dateGroup.date" class="date-group">
                <h3 class="date-header">{{ formatDate(dateGroup.date) }}</h3>

                <div v-for="cinemaGroup in dateGroup.cinemaGroups" :key="cinemaGroup.key" class="cinema-group">
                  <h4 class="cinema-group-header">Funciones disponibles {{ cinemaGroup.name }}</h4>

                  <div class="screenings-grid">
                    <div 
                      v-for="screening in cinemaGroup.screenings" 
                      :key="screening.id"
                      class="screening-card"
                      @click="goToBooking(screening.id)"
                    >
                      <div class="cinema-name">{{ getScreeningCinemaName(screening) }}</div>
                      <div class="room-name">Sala {{ getScreeningRoomName(screening) }}</div>
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
            </div>

            <div v-else class="no-data">
              No hay funciones disponibles para esta película
            </div>
          </div>

          <div class="synopsis">
            <h3>Sinopsis</h3>
            <p>{{ movie.synopsis }}</p>
          </div>
        </div>
      </div>

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

const getScreeningCinemaName = (screening) => {
  return screening?.cinema_name || screening?.cinema?.name || screening?.cinema?.cinema_name || 'Cine no disponible'
}

const getScreeningRoomName = (screening) => {
  return screening?.room_number || screening?.room?.room_number || screening?.room?.name || 'N/A'
}

const getScreeningDateKey = (screening) => {
  const rawDateTime = screening?.start_time || screening?.starts_at || ''
  if (!rawDateTime) return ''
  if (rawDateTime.includes('T')) return rawDateTime.split('T')[0]
  return rawDateTime.split(' ')[0]
}

const sortByStartTime = (list = []) => {
  return [...list].sort((a, b) => {
    const aTime = new Date(a?.start_time || a?.starts_at || 0).getTime()
    const bTime = new Date(b?.start_time || b?.starts_at || 0).getTime()
    return aTime - bTime
  })
}

const groupedScreenings = computed(() => {
  const groups = {}
  
  screenings.value.forEach(screening => {
    const date = getScreeningDateKey(screening)
    if (!date) return

    if (!groups[date]) {
      groups[date] = {
        date,
        screenings: [],
        cinemas: {}
      }
    }

    groups[date].screenings.push(screening)

    const cinemaName = getScreeningCinemaName(screening)
    const cinemaKey = String(screening?.cinema_id || cinemaName)
    if (!groups[date].cinemas[cinemaKey]) {
      groups[date].cinemas[cinemaKey] = {
        key: cinemaKey,
        name: cinemaName,
        screenings: []
      }
    }

    groups[date].cinemas[cinemaKey].screenings.push(screening)
  })

  return Object.values(groups)
    .map(group => ({
      date: group.date,
      screenings: sortByStartTime(group.screenings),
      cinemaGroups: Object.values(group.cinemas).map(cinemaGroup => ({
        ...cinemaGroup,
        screenings: sortByStartTime(cinemaGroup.screenings)
      }))
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
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
    if (!dateTimeString) return '--:--'
    if (typeof dateTimeString === 'string') {
      const timePart = dateTimeString.includes('T')
        ? dateTimeString.split('T')[1]
        : dateTimeString.split(' ')[1]

      if (timePart) return timePart.slice(0, 5)
    }

    const date = parseISO(dateTimeString)
    return format(date, 'HH:mm')
  } catch {
    if (!dateTimeString) return '--:--'
    return dateTimeString.includes('T')
      ? dateTimeString.split('T')[1]?.slice(0, 5) || '--:--'
      : dateTimeString.split(' ')[1] || '--:--'
  }
}

const goToBooking = (screeningId) => {
  router.push(`/booking/${screeningId}`)
}

const handleImageError = (event) => {
  event.target.src = moviePosterPlaceholder
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.28);
  margin: 2rem 0;
  box-shadow: 0 8px 22px rgba(10, 10, 24, 0.28);
}

.available-dates h3 {
  color: rgb(231, 231, 231);
  margin-bottom: 0.9rem;
  font-size: 1.35rem;
  letter-spacing: 0.2px;
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

.preview-cinema {
  font-size: 0.7rem;
  color: #e0e0e0;
  text-align: center;
  line-height: 1.2;
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
  font-size: 1.42rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.26);
  text-transform: capitalize;
  font-weight: 700;
}

.screenings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.screening-card {
  background: linear-gradient(150deg, #34363b 0%, #2b2d31 100%);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.24);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.screening-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.55);
}

.cinema-group {
  margin-bottom: 1.5rem;
}

.cinema-group-header {
  color: #e7e7e7;
  font-size: 1.15rem;
  margin-bottom: 0.7rem;
  padding-left: 0.25rem;
  font-weight: 650;
}

.cinema-name {
  color: var(--primary);
  font-weight: 700;
  font-size: 1.35rem;
  line-height: 1.2;
}

.room-name {
  color: #b9bcc9;
  font-size: 1rem;
  font-weight: 500;
}

.time {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.2px;
}

.available-seats {
  color: #cfd1da;
  font-size: 1rem;
}

.screening-card .btn.btn-primary {
  background: linear-gradient(100deg, #d50000 0%, #ff3d2f 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 14px;
  padding: 0.75rem 1rem;
}

.screening-card .btn.btn-primary:hover {
  filter: brightness(1.08);
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
    width: min(70vw, 260px);
    max-width: 260px;
    margin: 0 auto;
  }

  .movie-poster img {
    object-fit: contain;
    background: #141414;
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
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .screening-card {
    padding: 0.9rem;
    gap: 0.6rem;
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

  .preview-cinema {
    font-size: 0.62rem;
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
    width: min(78vw, 220px);
    max-width: 220px;
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
    font-size: 1.1rem;
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

  .preview-cinema {
    font-size: 0.58rem;
  }

  .screenings-section h2 {
    font-size: 1.2rem;
  }

  .screening-card {
    padding: 0.85rem;
    gap: 0.6rem;
  }

  .cinema-name {
    font-size: 1.15rem;
  }

  .room-name {
    font-size: 0.95rem;
  }

  .time {
    font-size: 1.45rem;
  }

  .available-seats {
    font-size: 0.95rem;
  }

  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
