<template>
  <section class="container">
    <div class="card auth">
      <h1>Ingresar</h1>

      <form
        class="auth__form"
        @submit.prevent="submit"
      >
        <input
          v-model="email"
          class="input"
          type="email"
          placeholder="Email"
        >
        <input
          v-model="password"
          class="input"
          type="password"
          placeholder="Contraseña"
        >

        <button
          class="btn btn-primary"
          :disabled="auth.loading"
        >
          {{ auth.loading ? 'Ingresando…' : 'Ingresar' }}
        </button>

        <p
          v-if="error"
          class="auth__error"
        >
          {{ error }}
        </p>
      </form>

      <p class="auth__muted">
        ¿No tenés cuenta?
        <RouterLink to="/register">
          Crear usuario
        </RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/authStore'

const router = useRouter()
const auth = useAuthStore()
auth.load()

const email = ref('')
const password = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push('/account')
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo iniciar sesión.'
  }
}
</script>

<style scoped>
.auth {
  max-width: 520px;
  margin: 20px auto 0;
  padding: 18px;
}

.auth__form {
  display: grid;
  gap: 12px;
  margin-top: 10px;
}

.auth__error {
  color: #991b1b;
  font-weight: 700;
}

.auth__muted {
  margin-top: 12px;
  color: var(--text-muted);
}

.input {
  width: 100%;
  min-height: 48px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  padding: 10px 12px;
  font-weight: 600;
}
</style>
