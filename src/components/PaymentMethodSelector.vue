<template>
  <div class="payment-methods">
    <h3>Selecciona un Método de Pago</h3>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Cargando métodos de pago...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadProviders" class="btn btn-primary">Reintentar</button>
    </div>

    <!-- Payment Methods Grid -->
    <div v-else class="methods-grid">
      <div
        v-for="provider in providers"
        :key="provider.id"
        class="payment-method"
        :class="{ active: modelValue === provider.id }"
        @click="selectMethod(provider.id)"
      >
        <div class="method-header">
          <span class="method-icon">{{ getProviderInfo(provider.name).icon }}</span>
          <h4>{{ getProviderInfo(provider.name).name }}</h4>
        </div>
        
        <p class="method-description">{{ getProviderInfo(provider.name).description }}</p>

        <!-- Provider-specific info -->
        <div v-if="provider.requires_redirect" class="method-badge badge-redirect">
          Redirección segura
        </div>
        <div v-if="provider.supports_webhook" class="method-badge badge-webhook">
          Confirmación automática
        </div>

        <div class="method-check">
          <input
            type="radio"
            :value="provider.id"
            :checked="modelValue === provider.id"
          >
        </div>
      </div>
    </div>

    <!-- Selected Method Details -->
    <div v-if="selectedProvider && !loading" class="method-details">
      <h4>Detalles del Pago</h4>
      <div class="details-content">
        <p><strong>Método:</strong> {{ getProviderInfo(selectedProvider.name).name }}</p>
        <p v-if="selectedProvider.requires_redirect" class="info-text">
          ℹ️ Serás redirigido a {{ getProviderInfo(selectedProvider.name).name }} para completar el pago de forma segura.
        </p>
        <p v-else class="info-text">
          ℹ️ Por favor, completa los detalles del pago en el formulario.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { paymentService } from '@/services/paymentService'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const providers = ref([])
const loading = ref(false)
const error = ref(null)

const selectedProvider = computed(() => {
  return providers.value.find(p => p.id === props.modelValue)
})

const loadProviders = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await paymentService.getPaymentProviders()
    console.log('Payment providers loaded:', data)
    
    // Manejar diferentes formatos de respuesta
    let providersList = []
    
    if (Array.isArray(data)) {
      providersList = data
    } else if (data.data && Array.isArray(data.data)) {
      providersList = data.data
    } else if (data.success && Array.isArray(data.success)) {
      providersList = data.success
    } else {
      console.warn('Unexpected data format:', data)
      providersList = []
    }
    
    // Filtrar solo proveedores activos
    providers.value = providersList.filter(p => p.is_active !== false)
    console.log('Filtered providers:', providers.value)
  } catch (err) {
    error.value = 'No se pudieron cargar los métodos de pago. Por favor, intenta más tarde.'
    console.error('Error loading payment providers:', err)
  } finally {
    loading.value = false
  }
}

const selectMethod = (providerId) => {
  emit('update:modelValue', providerId)
}

const getProviderInfo = (providerName) => {
  return paymentService.getProviderInfo(providerName)
}

onMounted(() => {
  loadProviders()
})
</script>

<style scoped>
.payment-methods {
  margin: 2rem 0;
}

.payment-methods h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.loading, .error-message {
  padding: 2rem;
  text-align: center;
  background: var(--gray-dark);
  border-radius: var(--border-radius-sm);
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid #dc2626;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.payment-method {
  border: 2px solid var(--gray-darker);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: var(--gray-dark);
  box-shadow: var(--shadow-sm);
}

.payment-method:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
}

.payment-method.active {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.05);
  box-shadow: var(--shadow-lg);
}

.method-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.method-icon {
  font-size: 2rem;
}

.payment-method h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.method-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 1rem 0;
}

.method-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.badge-redirect {
  background: rgba(102, 126, 234, 0.15);
  color: var(--primary);
}

.badge-webhook {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.method-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.method-check input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--primary);
}

.method-details {
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: var(--border-radius-sm);
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: var(--shadow-sm);
}

.method-details h4 {
  margin-top: 0;
  color: var(--primary);
}

.details-content p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.info-text {
  margin-top: 1rem;
  font-style: italic;
}

/* Use global .btn and .btn-primary from src/style.css for consistent button styles */

@media (max-width: 768px) {
  .methods-grid {
    grid-template-columns: 1fr;
  }

  .method-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .method-icon {
    font-size: 1.5rem;
  }
}
</style>
