<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Iniciar Sesión</h1>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="tu@email.com"
            >
          </div>

          <div class="form-group">
            <label for="password">Contraseña:</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
            >
          </div>

          <button type="submit" :disabled="isLoading" class="btn btn-primary btn-full">
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <p v-if="error" class="error-message">
          {{ error }}
        </p>

        <div class="auth-footer">
          <p>¿No tienes cuenta?</p>
          <router-link to="/register">Crear cuenta</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // In a real app, call API endpoint
    // For now, we'll use a mock login
    const response = await loginUser(form.value.email, form.value.password)

    if (response.success) {
      // Store token and user info
      authStore.setUser(response.user)
      authStore.setToken(response.token)

      // Redirect to previous page or home
      router.push(router.currentRoute.value.query.redirect || '/')
    } else {
      error.value = response.message || 'Error al iniciar sesión'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Error al conectar con el servidor'
  } finally {
    isLoading.value = false
  }
}

// Mock login function - replace with actual API call
const loginUser = async (email, password) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful login
      resolve({
        success: true,
        user: {
          id: 1,
          name: email.split('@')[0],
          email: email
        },
        token: 'mock_token_' + Date.now()
      })
    }, 1000)
  })
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 0 1rem;
}

.auth-card {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-lg);
}

.auth-card h1 {
  color: var(--primary);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #ccc;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.875rem;
  background: #1a1a1a;
  border: 1px solid #3d3d3d;
  border-radius: var(--border-radius-sm);
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group input::placeholder {
  color: #666;
}

.btn-full {
  width: 100%;
  margin-bottom: 1rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger);
  padding: 0.75rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.95rem;
}

.auth-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #3d3d3d;
}

.auth-footer p {
  color: #999;
  margin: 0 0 0.5rem 0;
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-footer a:hover {
  color: #fff;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 1.5rem;
  }

  .auth-card h1 {
    font-size: 1.5rem;
  }
}
</style>
