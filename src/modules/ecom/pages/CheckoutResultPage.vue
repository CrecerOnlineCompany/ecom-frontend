<template>
  <section class="container">
    <div class="card result">
      <h1 class="result__title">
        Resultado del pago
      </h1>
      <p class="result__text">
        {{ message }}
      </p>

      <div class="result__actions">
        <RouterLink
          to="/"
          class="btn btn-secondary"
        >
          Volver a la tienda
        </RouterLink>
        <RouterLink
          v-if="orderLink"
          :to="orderLink"
          class="btn btn-primary"
        >
          Ver orden
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'

const route = useRoute()
const cart = useEcomCartStore()

const status = computed(() => String(route.query.status || 'pending'))

const message = computed(() => {
  if (status.value === 'success') return 'Pago aprobado. Gracias por tu compra.'
  if (status.value === 'failure') return 'El pago falló. Podés intentar nuevamente.'
  return 'Pago pendiente. Te avisaremos cuando se confirme.'
})

const orderLink = computed(() => {
  const orderNumber = cart.lastOrderNumber || ''
  if (!orderNumber) return ''
  return `/orders/${encodeURIComponent(orderNumber)}`
})
</script>

<style scoped>
.result {
  padding: 18px;
  margin-top: 18px;
}

.result__title {
  margin-bottom: 10px;
}

.result__text {
  margin-bottom: 14px;
  color: var(--text-secondary);
}

.result__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

