<template>
  <section class="container">
    <div class="card auth">
      <h1>Crear cuenta</h1>

      <form
        class="auth__form"
        @submit.prevent="submit"
      >
        <input
          v-model="name"
          class="input"
          type="text"
          placeholder="Nombre"
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
        <input
          v-model="password2"
          class="input"
          type="password"
          placeholder="Repetir contraseña"
        >

        <button
          class="btn btn-primary"
          :disabled="auth.loading"
        >
          {{ auth.loading ? 'Creando…' : 'Crear cuenta' }}
        </button>

        <p
          v-if="error"
          class="auth__error"
        >
          {{ error }}
        </p>
      </form>

      <p class="auth__muted">
        ¿Ya tenés cuenta?
        <RouterLink to="/login">
          Ingresar
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

const name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const error = ref('')

const submit = async () => {
  error.value = ''
  if (!name.value || !email.value || !password.value) {
    error.value = 'Completá todos los campos.'
    return
  }
  if (password.value !== password2.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password2.value,
    })
    router.push('/account')
  } catch (e) {
    const msg = e?.response?.data?.message
    error.value = msg || 'No se pudo crear la cuenta.'
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
