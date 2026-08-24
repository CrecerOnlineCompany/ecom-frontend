<template>
  <section class="container">
    <RouterLink
      to="/"
      class="back-link"
    >
      ← Volver
    </RouterLink>

    <div
      v-if="loading"
      class="card"
    >
      Cargando orden…
    </div>
    <div
      v-else-if="error"
      class="card card--error"
    >
      {{ error }}
    </div>

    <div
      v-else-if="order"
      class="card order"
    >
      <h1 class="order__title">
        Orden {{ order.order_number }}
      </h1>

      <div class="order__meta">
        <div><strong>Cliente:</strong> {{ order.customer_name }} ({{ order.customer_email }})</div>
        <div><strong>Estado:</strong> {{ order.status }}</div>
        <div><strong>Pago:</strong> {{ order.payment_status }}</div>
      </div>

      <div class="order__divider" />

      <h2>Items</h2>
      <div class="order__items">
        <div
          v-for="line in order.line_items"
          :key="line.id"
          class="order__line"
        >
          <span>{{ line.title }} x {{ line.quantity }}</span>
          <Money :amount="line.subtotal" />
        </div>
      </div>

      <div class="order__divider" />
      <div class="order__totals">
        <div class="order__line">
          <span>Subtotal</span><Money :amount="order.subtotal_amount" />
        </div>
        <div class="order__line">
          <span>Descuento</span><Money :amount="-Number(order.discount_amount || 0)" />
        </div>
        <div
          v-if="Number(order.shipping_amount || 0) > 0"
          class="order__line"
        >
          <span>Envío</span><Money :amount="order.shipping_amount" />
        </div>
        <div class="order__line order__line--total">
          <span>Total</span><Money :amount="order.total_amount" />
        </div>
      </div>

      <div
        v-if="hasDigital"
        class="order__divider"
      />
      <div
        v-if="hasDigital"
        class="order__downloads"
      >
        <h2>Descargas</h2>

        <div
          v-if="!isPaid"
          class="order__muted"
        >
          Las descargas se habilitan cuando el pago esté aprobado.
        </div>

        <div
          v-else-if="!auth.isAuthenticated"
          class="order__muted"
        >
          Iniciá sesión para acceder a tus descargas.
          <RouterLink to="/login">
            Ingresar
          </RouterLink>
        </div>

        <div
          v-else-if="loadingDownloads"
          class="order__muted"
        >
          Cargando descargas…
        </div>

        <ul
          v-else
          class="order__download-list"
        >
          <li
            v-for="d in downloads"
            :key="d.line_item_id"
          >
            <a
              class="btn btn-secondary btn-sm"
              :href="d.url"
              target="_blank"
              rel="noreferrer"
            >
              Descargar: {{ d.title }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Money from '@/modules/ecom/components/Money.vue'
import { ecomApi } from '@/modules/ecom/services/ecomApi'
import { useAuthStore } from '@/modules/auth/stores/authStore'

const route = useRoute()
const auth = useAuthStore()
auth.load()

const loading = ref(false)
const error = ref('')
const order = ref(null)
const downloads = ref([])
const loadingDownloads = ref(false)

const hasDigital = computed(() => {
  const lines = order.value?.line_items || []
  return Array.isArray(lines) && lines.some((l) => l?.product?.product_type === 'digital' && l?.product?.digital_url)
})

const isPaid = computed(() => String(order.value?.status_code || '') === 'payed' || String(order.value?.status || '') === 'paid')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await ecomApi.getOrder(route.params.orderNumber)
    order.value = response.order

    if (auth.isAuthenticated) {
      await auth.fetchMe()
    }

    if (auth.isAuthenticated && isPaid.value && hasDigital.value) {
      loadingDownloads.value = true
      try {
        const d = await ecomApi.getOrderDownloads(order.value.order_number)
        downloads.value = d.downloads || []
      } catch {
        downloads.value = []
      } finally {
        loadingDownloads.value = false
      }
    }
  } catch {
    error.value = 'No se pudo cargar la orden.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.back-link {
  display: inline-block;
  margin: 16px 0;
  color: var(--text-muted);
}

.card--error {
  border-color: rgba(239, 68, 68, 0.45);
}

.order {
  padding: 18px;
}

.order__title {
  margin-bottom: 10px;
}

.order__meta {
  display: grid;
  gap: 8px;
  color: var(--text-secondary);
  font-weight: 600;
}

.order__divider {
  margin: 14px 0;
  border-top: 1px solid var(--border);
}

.order__items,
.order__totals {
  display: grid;
  gap: 10px;
}

.order__line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-secondary);
  font-weight: 700;
}

.order__line--total {
  color: var(--text-primary);
  font-weight: 900;
  font-size: 1.1rem;
}

.order__downloads {
  display: grid;
  gap: 10px;
}

.order__muted {
  color: var(--text-muted);
  font-weight: 700;
}

.order__download-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
</style>
