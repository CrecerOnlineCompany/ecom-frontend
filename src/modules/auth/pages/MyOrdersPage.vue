<template>
  <section class="container">
    <div class="page-head">
      <div>
        <h1 class="page-title">
          Mis órdenes
        </h1>
        <p class="page-subtitle">
          Historial de compras de la tienda actual.
        </p>
      </div>
      <RouterLink
        to="/account"
        class="btn btn-secondary btn-sm"
      >
        Volver
      </RouterLink>
    </div>

    <div
      v-if="!auth.isAuthenticated"
      class="card p"
    >
      <p>Necesitás iniciar sesión.</p>
      <RouterLink
        to="/login"
        class="btn btn-primary"
      >
        Ingresar
      </RouterLink>
    </div>

    <div
      v-else-if="loading"
      class="card p"
    >
      Cargando…
    </div>
    <div
      v-else-if="!orders.length"
      class="card p"
    >
      No tenés órdenes todavía.
    </div>

    <div
      v-else
      class="grid"
    >
      <article
        v-for="o in orders"
        :key="o.id"
        class="card p order-card"
      >
        <div class="order-card__top">
          <div class="order-card__num">
            {{ o.order_number }}
          </div>
          <div class="order-card__status">
            {{ o.status }}
            <span
              v-if="o.has_digital"
              class="order-card__badge"
            >Digital</span>
          </div>
        </div>
        <div class="order-card__meta">
          <div><strong>Total:</strong> <Money :amount="o.total_amount" /></div>
          <div><strong>Pago:</strong> {{ o.payment_status }}</div>
        </div>
        <RouterLink
          class="btn btn-secondary btn-sm"
          :to="`/orders/${encodeURIComponent(o.order_number)}`"
        >
          Ver detalle
        </RouterLink>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Money from '@/modules/ecom/components/Money.vue'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { ecomApi } from '@/modules/ecom/services/ecomApi'

const auth = useAuthStore()
auth.load()

const loading = ref(false)
const orders = ref([])

onMounted(async () => {
  await auth.fetchMe()
  if (!auth.isAuthenticated) return

  loading.value = true
  try {
    const response = await ecomApi.getMyOrders()
    orders.value = response.orders || []
  } finally {
    loading.value = false
  }
})
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

.order-card {
  display: grid;
  gap: 10px;
}

.order-card__top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-weight: 900;
}

.order-card__status {
  color: var(--text-muted);
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.order-card__badge {
  background: rgba(249, 115, 22, 0.18);
  border: 1px solid rgba(249, 115, 22, 0.35);
  color: #fdba74;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
}

.order-card__meta {
  display: grid;
  gap: 6px;
  color: var(--text-secondary);
  font-weight: 700;
}
</style>
