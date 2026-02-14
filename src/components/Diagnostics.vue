<template>
  <div class="diagnostics">
    <button @click="toggleDiagnostics" class="diag-toggle">
      {{ showDiagnostics ? '❌ Ocultar' : '🔍 Debug' }}
    </button>
    
    <div v-if="showDiagnostics" class="diag-panel">
      <h3>Panel de Diagnóstico</h3>
      
      <div class="diag-section">
        <h4>Configuración API</h4>
        <p><strong>URL Base:</strong> <code>{{ apiUrl }}</code></p>
        <p><strong>Timeout:</strong> <code>{{ apiTimeout }}ms</code></p>
      </div>

      <div class="diag-section">
        <h4>Pruebas de Conexión</h4>
        <button @click="testApiConnection" class="btn-test">
          {{ testLoading ? 'Probando...' : 'Probar Conexión API' }}
        </button>
        <div v-if="testResult" :class="['test-result', testResult.status]">
          <p><strong>Estado:</strong> {{ testResult.status === 'success' ? '✅ Éxito' : '❌ Error' }}</p>
          <p><strong>Endpoint:</strong> {{ testResult.endpoint }}</p>
          <p><strong>Respuesta:</strong> <code>{{ testResult.message }}</code></p>
          <details v-if="testResult.data">
            <summary>Ver datos</summary>
            <pre>{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </details>
        </div>
      </div>

      <div class="diag-section">
        <h4>Autenticación</h4>
        <p><strong>Token:</strong> <code>{{ authToken ? authToken.substring(0, 20) + '...' : 'No hay token' }}</code></p>
      </div>

      <div class="diag-section">
        <h4>Logs de Consola</h4>
        <button @click="clearLogs" class="btn-test">Limpiar Logs</button>
        <div class="logs">
          <div v-for="(log, idx) in logs" :key="idx" :class="['log', log.type]">
            <span class="time">{{ log.time }}</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const showDiagnostics = ref(false)
const testLoading = ref(false)
const testResult = ref(null)
const logs = ref([])
const apiUrl = ref('')
const apiTimeout = ref('')
const authToken = ref('')

onMounted(() => {
  apiUrl.value = import.meta.env.VITE_API_URL || '/api'
  apiTimeout.value = import.meta.env.VITE_API_TIMEOUT || 30000
  authToken.value = localStorage.getItem('auth_token') || ''
  
  // Interceptar logs
  setupLogInterception()
})

const toggleDiagnostics = () => {
  showDiagnostics.value = !showDiagnostics.value
}

const testApiConnection = async () => {
  testLoading.value = true
  testResult.value = null
  
  try {
    const response = await api.get('/movies')
    const movieCount = response.data.data ? response.data.data.length : (Array.isArray(response.data) ? response.data.length : 0)
    
    testResult.value = {
      status: 'success',
      endpoint: '/movies',
      message: `Películas cargadas: ${movieCount}`,
      data: response.data
    }
    
    addLog('success', `✅ API /movies: ${movieCount} películas`)
  } catch (error) {
    testResult.value = {
      status: 'error',
      endpoint: '/movies',
      message: error.message,
      data: error.response?.data
    }
    
    addLog('error', `❌ API Error: ${error.message}`)
  } finally {
    testLoading.value = false
  }
}

const setupLogInterception = () => {
  const originalLog = console.log
  const originalError = console.error

  console.log = function(...args) {
    originalLog.apply(console, args)
    addLog('log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
  }

  console.error = function(...args) {
    originalError.apply(console, args)
    addLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
  }
}

const addLog = (type, message) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ type, message, time })
  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}
</script>

<style scoped>
.diagnostics {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.diag-toggle {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.diag-toggle:hover {
  background: #5568d3;
}

.diag-panel {
  position: fixed;
  bottom: 60px;
  right: 20px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: var(--border-radius-sm);
  padding: 1.5rem;
  max-width: 500px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.diag-panel h3 {
  margin-top: 0;
  color: #667eea;
  margin-bottom: 1rem;
}

.diag-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.diag-section:last-child {
  border-bottom: none;
}

.diag-section h4 {
  color: #cbd5e1;
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
}

.diag-section p {
  margin: 0.5rem 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

code {
  background: #0f172a;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  color: #f1f5f9;
  font-family: monospace;
  word-break: break-all;
}

.btn-test {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.btn-test:hover {
  background: #5568d3;
}

.test-result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  background: #0f172a;
  border-left: 4px solid;
}

.test-result.success {
  border-left-color: #10b981;
}

.test-result.error {
  border-left-color: #ef4444;
}

.test-result p {
  margin: 0.5rem 0;
  color: #cbd5e1;
}

details {
  margin-top: 0.5rem;
}

details summary {
  cursor: pointer;
  color: #667eea;
  font-size: 0.85rem;
}

pre {
  background: #0f172a;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  overflow-x: auto;
  color: #cbd5e1;
}

.logs {
  background: #0f172a;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
}

.log {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  padding: 0.25rem;
  color: #cbd5e1;
  border-bottom: 1px solid #334155;
}

.log.error {
  color: #ef4444;
}

.log.success {
  color: #10b981;
}

.time {
  color: #64748b;
  min-width: 65px;
}

.message {
  flex: 1;
  word-break: break-all;
}
</style>
