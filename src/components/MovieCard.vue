<template>
  <div class="movie-card" :class="{ 'hover-effect': config.features.movieCard.hoverEffect }">
    <div class="movie-poster">
      <img 
        :src="movieImageUrl" 
        :alt="movie.title"
        @error="handleImageError"
      >
      <div v-if="config.features.movieCard.showOverlay" class="movie-overlay">
        <button class="btn btn-primary" @click="$emit('click')">Ver Detalles</button>
      </div>
    </div>
    <div class="movie-info">
      <h3>{{ movie.title }}</h3>
      <p v-if="config.features.movieCard.showGenre" class="genre">{{ movie.genre }}</p>
      <p v-if="config.features.movieCard.showDescription && movie.description" class="description">
        {{ movie.description }}
      </p>
      <div class="movie-meta">
        <span v-if="config.features.movieCard.showRating" class="rating">
          {{ displayRating }}
        </span>
        <span v-if="config.features.movieCard.showDuration" class="duration">
          {{ movie.duration }} min
        </span>
        <span v-if="config.features.movieCard.showReleaseDate && movie.release_date" class="release-date">
          {{ formatDate(movie.release_date) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { moviePosterPlaceholder } from '@/utils/placeholder'
import { useAppConfig } from '@/composables/useAppConfig'

const { config, formatRating, formatDate } = useAppConfig()

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const movieImageUrl = computed(() => {
  const url = props.movie?.poster_image_url || props.movie?.poster_url
  return (url && typeof url === 'string' && url.trim()) ? url : moviePosterPlaceholder
})

const displayRating = computed(() => {
  if (!props.movie.rating) return 'N/A'
  
  const rating = props.movie.rating
  const { ratingFormat, maxStars, showStars } = config.value.features.movieCard
  
  if (!showStars) {
    return rating.toFixed(1)
  }
  
  switch (ratingFormat) {
    case 'stars':
      return '⭐'.repeat(Math.min(Math.round((rating / 10) * maxStars), maxStars))
    case 'number':
      return rating.toFixed(1)
    case 'both':
      return `⭐ ${rating.toFixed(1)}`
    default:
      return `⭐ ${rating.toFixed(1)}`
  }
})

const handleImageError = (event) => {
  event.target.src = moviePosterPlaceholder
}
</script>

<style scoped>
.movie-card {
  cursor: pointer;
  transition: var(--transition);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.movie-card.hover-effect:hover,
.movie-card.hover-effect:active {
  transform: translateY(v-bind('config.features.movieCard.translateYOnHover + "px"')) scale(1.02);
  box-shadow: 0 12px 32px v-bind('config.colors.primary + "66"');
}

.movie-poster {
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
  aspect-ratio: v-bind('config.features.movieCard.aspectRatio');
  background: v-bind('config.colors.background.gradient.end');
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-lg);
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.movie-card.hover-effect:hover .movie-poster img,
.movie-card.hover-effect:active .movie-poster img {
  transform: scale(v-bind('config.features.movieCard.scaleOnHover'));
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
  border-radius: var(--border-radius-lg);
}

.movie-card.hover-effect:hover .movie-overlay,
.movie-card.hover-effect:active .movie-overlay {
  opacity: 1;
}

.movie-info {
  padding: 8px;
}

.movie-info h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.genre {
  color: var(--primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.6;
}

.movie-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 1.1rem;
  color: var(--text-muted);
  padding-top: 1rem;
  border-top: 2px solid var(--gray-darker);
}

.movie-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating {
  color: var(--warning);
  font-weight: 600;
  font-size: 1.2rem;
}

.duration,
.release-date {
  font-size: 1rem;
}

/* Pantallas grandes TOTEM */
@media (min-width: 1920px) {
  .movie-info h3 {
    font-size: 1.6rem;
  }
  
  .genre {
    font-size: 1.1rem;
  }
  
  .description {
    font-size: 1.1rem;
  }
  
  .movie-meta {
    font-size: 1.2rem;
  }
  
  .rating {
    font-size: 1.4rem;
  }
}
</style>
