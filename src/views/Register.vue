<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Crear Cuenta</h1>

        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="name">Nombre Completo:</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              placeholder="Juan Pérez"
            >
          </div>

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
              minlength="8"
            >
            <small>Mínimo 8 caracteres</small>
          </div>

          <div class="form-group">
            <label for="password_confirm">Confirmar Contraseña:</label>
            <input
              id="password_confirm"
              v-model="form.password_confirm"
              type="password"
              required
              placeholder="••••••••"
            >
          </div>

          <div class="form-group checkbox">
            <input
              id="terms"
              v-model="form.acceptTerms"
              type="checkbox"
              required
            >
            <label for="terms">
              Acepto los términos y condiciones
            </label>
          </div>

          <button type="submit" :disabled="isLoading" class="btn btn-primary btn-full">
            {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </form>

        <p v-if="error" class="error-message">
          {{ error }}
        </p>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta?</p>
          <router-link to="/login">Inicia sesión</router-link>
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
  name: '',
  email: '',
  password: '',
  password_confirm: '',
  acceptTerms: false
})

const isLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  // Validate passwords match
  if (form.value.password !== form.value.password_confirm) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  // Validate password length
  if (form.value.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  isLoading.value = true

  try {
    // In a real app, call API endpoint
    // For now, we'll use a mock registration
    const response = await registerUser(form.value)

    if (response.success) {
      // Store token and user info
      authStore.setUser(response.user)
      authStore.setToken(response.token)

      // Redirect to home or movies page
      router.push('/')
    } else {
      error.value = response.message || 'Error al crear cuenta'
    }
  } catch (err) {
    console.error('Registration error:', err)
    error.value = 'Error al conectar con el servidor'
  } finally {
    isLoading.value = false
  }
}

// Mock registration function - replace with actual API call
const registerUser = async (userData) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful registration
      resolve({
        success: true,
        user: {
          id: Math.floor(Math.random() * 10000),
          name: userData.name,
          email: userData.email
        },
        token: 'mock_token_' + Date.now()
      })
    }, 1500)
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

.form-group small {
  display: block;
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-group.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.form-group.checkbox input {
  width: auto;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.form-group.checkbox label {
  margin: 0;
  font-weight: 400;
  flex: 1;
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
