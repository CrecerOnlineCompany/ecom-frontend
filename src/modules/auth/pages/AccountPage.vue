<template>
  <section class="container">
    <div class="page-head">
      <div>
        <h1 class="page-title">
          Mi cuenta
        </h1>
        <p
          v-if="auth.user"
          class="page-subtitle"
        >
          Hola, {{ auth.user.name }} ({{ auth.user.email }})
        </p>
      </div>
      <button
        v-if="auth.isAuthenticated"
        class="btn btn-secondary btn-sm"
        :disabled="auth.loading"
        @click="logout"
      >
        Salir
      </button>
    </div>

    <div
      v-if="!auth.isAuthenticated"
      class="card p"
    >
      <p>Necesitás iniciar sesión.</p>
      <div class="actions">
        <RouterLink
          to="/login"
          class="btn btn-primary"
        >
          Ingresar
        </RouterLink>
        <RouterLink
          to="/register"
          class="btn btn-secondary"
        >
          Crear cuenta
        </RouterLink>
      </div>
    </div>

    <div
      v-else
      class="grid"
    >
      <div class="card p">
        <h2>Órdenes</h2>
        <RouterLink
          to="/account/orders"
          class="btn btn-primary btn-sm"
        >
          Ver mis órdenes
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/authStore'

const router = useRouter()
const auth = useAuthStore()
auth.load()

onMounted(() => {
  auth.fetchMe()
})

const logout = async () => {
  await auth.logout()
  router.push('/')
}
</script>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin: 18px 0 16px;
}

.page-title {
  margin-bottom: 4px;
}

.page-subtitle {
  margin: 0;
  color: var(--text-muted);
}

.p {
  padding: 18px;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

