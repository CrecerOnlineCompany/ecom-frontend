<!--
  COMPONENTE DE EJEMPLO: ConfigDemo.vue
  
  Este componente demuestra cómo usar el sistema de configuración.
  Puedes importarlo en cualquier vista para ver los ejemplos en acción.
  
  Uso:
  import ConfigDemo from '@/components/ConfigDemo.vue'
-->

<template>
  <div class="config-demo">
    <div class="container">
      <h1>🎨 Demo del Sistema de Configuración</h1>
      
      <!-- Sección de Colores -->
      <section class="demo-section">
        <h2>Colores del Tema</h2>
        <div class="color-grid">
          <div class="color-item">
            <div class="color-box" :style="{ background: colors.primary }"></div>
            <span>Primary</span>
            <code>{{ colors.primary }}</code>
          </div>
          <div class="color-item">
            <div class="color-box" :style="{ background: colors.secondary }"></div>
            <span>Secondary</span>
            <code>{{ colors.secondary }}</code>
          </div>
          <div class="color-item">
            <div class="color-box" :style="{ background: colors.accent }"></div>
            <span>Accent</span>
            <code>{{ colors.accent }}</code>
          </div>
          <div class="color-item">
            <div class="color-box" :style="{ background: colors.success }"></div>
            <span>Success</span>
            <code>{{ colors.success }}</code>
          </div>
          <div class="color-item">
            <div class="color-box" :style="{ background: colors.warning }"></div>
            <span>Warning</span>
            <code>{{ colors.warning }}</code>
          </div>
          <div class="color-item">
            <div class="color-box" :style="{ background: colors.danger }"></div>
            <span>Danger</span>
            <code>{{ colors.danger }}</code>
          </div>
        </div>
      </section>

      <!-- Sección de MovieCard Config -->
      <section class="demo-section">
        <h2>Configuración de MovieCard</h2>
        <div class="config-list">
          <div class="config-item">
            <span class="label">Mostrar Estrellas:</span>
            <span class="value" :class="{ active: features.movieCard.showStars }">
              {{ features.movieCard.showStars ? '✅ Sí' : '❌ No' }}
            </span>
          </div>
          <div class="config-item">
            <span class="label">Mostrar Descripción:</span>
            <span class="value" :class="{ active: features.movieCard.showDescription }">
              {{ features.movieCard.showDescription ? '✅ Sí' : '❌ No' }}
            </span>
          </div>
          <div class="config-item">
            <span class="label">Mostrar Género:</span>
            <span class="value" :class="{ active: features.movieCard.showGenre }">
              {{ features.movieCard.showGenre ? '✅ Sí' : '❌ No' }}
            </span>
          </div>
          <div class="config-item">
            <span class="label">Mostrar Duración:</span>
            <span class="value" :class="{ active: features.movieCard.showDuration }">
              {{ features.movieCard.showDuration ? '✅ Sí' : '❌ No' }}
            </span>
          </div>
          <div class="config-item">
            <span class="label">Formato de Rating:</span>
            <span class="value active">{{ features.movieCard.ratingFormat }}</span>
          </div>
          <div class="config-item">
            <span class="label">Estrellas Máximas:</span>
            <span class="value active">{{ features.movieCard.maxStars }}</span>
          </div>
          <div class="config-item">
            <span class="label">Efecto Hover:</span>
            <span class="value" :class="{ active: features.movieCard.hoverEffect }">
              {{ features.movieCard.hoverEffect ? '✅ Sí' : '❌ No' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Sección de Ejemplos de Rating -->
      <section class="demo-section">
        <h2>Ejemplos de Rating</h2>
        <div class="rating-examples">
          <div class="rating-item">
            <span class="rating-label">Rating 8.5/10:</span>
            <span class="rating-display">{{ formatRating(8.5) }}</span>
          </div>
          <div class="rating-item">
            <span class="rating-label">Rating 7.0/10:</span>
            <span class="rating-display">{{ formatRating(7.0) }}</span>
          </div>
          <div class="rating-item">
            <span class="rating-label">Rating 9.5/10:</span>
            <span class="rating-display">{{ formatRating(9.5) }}</span>
          </div>
        </div>
      </section>

      <!-- Sección de Funciones Helper -->
      <section class="demo-section">
        <h2>Funciones Helper</h2>
        <div class="helper-examples">
          <div class="helper-item">
            <code>formatPrice(15.50)</code>
            <span class="result">{{ formatPrice(15.50) }}</span>
          </div>
          <div class="helper-item">
            <code>formatPrice(120.00)</code>
            <span class="result">{{ formatPrice(120.00) }}</span>
          </div>
          <div class="helper-item">
            <code>formatDate('2024-12-17')</code>
            <span class="result">{{ formatDate('2024-12-17') }}</span>
          </div>
          <div class="helper-item">
            <code>formatTime('14:30:00')</code>
            <span class="result">{{ formatTime('14:30:00') }}</span>
          </div>
        </div>
      </section>

      <!-- Información de la App -->
      <section class="demo-section">
        <h2>Información de la Aplicación</h2>
        <div class="app-info">
          <div class="info-item">
            <span class="label">Nombre:</span>
            <span class="value">{{ app.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Versión:</span>
            <span class="value">{{ app.version }}</span>
          </div>
          <div class="info-item">
            <span class="label">Moneda:</span>
            <span class="value">{{ app.currencySymbol }} ({{ app.currency }})</span>
          </div>
          <div class="info-item">
            <span class="label">Locale:</span>
            <span class="value">{{ app.locale }}</span>
          </div>
        </div>
      </section>

      <!-- Notas -->
      <section class="demo-section notes">
        <h3>📝 Notas:</h3>
        <ul>
          <li>Todos estos valores se pueden cambiar en <code>/src/config/appConfig.js</code></li>
          <li>Los cambios se aplican automáticamente al guardar el archivo</li>
          <li>Consulta <code>CONFIG_GUIDE.md</code> para más información</li>
          <li>Usa <code>useAppConfig()</code> en tus componentes para acceder a la configuración</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useAppConfig } from '@/composables/useAppConfig'

const { 
  colors, 
  features, 
  app,
  formatRating, 
  formatPrice, 
  formatDate, 
  formatTime 
} = useAppConfig()
</script>

<style scoped>
.config-demo {
  padding: 2rem 0;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

h1 {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 3rem;
}

.demo-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius);
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.demo-section h2 {
  color: var(--primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* Color Grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.color-box {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-lg);
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.color-item span {
  font-weight: 600;
  color: var(--text-primary);
}

.color-item code {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
}

/* Config List */
.config-list {
  display: grid;
  gap: 1rem;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--gray-dark);
}

.config-item .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.config-item .value {
  color: var(--text-muted);
  font-family: 'Courier New', monospace;
}

.config-item .value.active {
  color: var(--primary);
  font-weight: 600;
}

/* Rating Examples */
.rating-examples {
  display: grid;
  gap: 1rem;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-sm);
}

.rating-label {
  color: var(--text-secondary);
}

.rating-display {
  font-size: 1.2rem;
  color: var(--warning);
}

/* Helper Examples */
.helper-examples {
  display: grid;
  gap: 1rem;
}

.helper-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-sm);
}

.helper-item code {
  color: var(--accent);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-family: 'Courier New', monospace;
}

.helper-item .result {
  color: var(--primary);
  font-weight: 600;
  font-size: 1.1rem;
}

/* App Info */
.app-info {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-sm);
}

.info-item .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item .value {
  color: var(--primary);
  font-weight: 600;
}

/* Notes */
.notes {
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid var(--primary);
}

.notes h3 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.notes ul {
  list-style: none;
  padding: 0;
}

.notes li {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notes li::before {
  content: '→';
  color: var(--primary);
  font-weight: bold;
}

.notes code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: var(--accent);
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .color-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .helper-item,
  .rating-item,
  .config-item,
  .info-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
