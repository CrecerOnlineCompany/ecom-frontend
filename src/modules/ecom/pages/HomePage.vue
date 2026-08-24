<template>
  <section class="container">
    <div class="page-head">
      <div>
        <h1 class="page-title">
          Tienda
        </h1>
        <p class="page-subtitle">
          Explorá el catálogo y armá tu carrito.
        </p>
      </div>
      <RouterLink
        to="/cart"
        class="btn btn-secondary btn-sm"
      >
        Ver carrito ({{ cart.totalItems }})
      </RouterLink>
    </div>

    <div class="filters card">
      <div class="filters__row">
        <input
          v-model="q"
          class="input"
          type="text"
          placeholder="Buscar por nombre, SKU o descripción…"
        >
        <select
          v-model="category"
          class="input"
        >
          <option value="">
            Todas las categorías
          </option>
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.slug"
          >
            {{ c.name }}
          </option>
        </select>
        <select
          v-model="tag"
          class="input"
        >
          <option value="">
            Todos los tags
          </option>
          <option
            v-for="t in tags"
            :key="t.id"
            :value="t.slug"
          >
            {{ t.name }}
          </option>
        </select>
        <button
          class="btn btn-primary btn-sm"
          :disabled="loading"
          @click="fetchCatalog"
        >
          Buscar
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="card"
    >
      Cargando catálogo…
    </div>
    <div
      v-else-if="!products.length"
      class="card"
    >
      No hay productos con esos filtros.
    </div>

    <div
      v-else
      class="grid grid-3"
    >
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
        @add="addToCart"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProductCard from '@/modules/ecom/components/ProductCard.vue'
import { ecomApi } from '@/modules/ecom/services/ecomApi'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'

const cart = useEcomCartStore()

const loading = ref(false)
const products = ref([])
const categories = ref([])
const tags = ref([])

const q = ref('')
const category = ref('')
const tag = ref('')

const fetchCatalog = async () => {
  loading.value = true
  try {
    const response = await ecomApi.getCatalog({
      q: q.value || undefined,
      category: category.value || undefined,
      tag: tag.value || undefined,
    })
    products.value = response.products || []
    categories.value = response.categories || []
    tags.value = response.tags || []
  } finally {
    loading.value = false
  }
}

const addToCart = async (product) => {
  cart.addProduct(product, 1)
  await cart.refreshQuote()
}

onMounted(async () => {
  cart.load()
  await fetchCatalog()
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

.filters {
  margin: 14px 0 18px;
  padding: 16px;
}

.filters__row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr auto;
  gap: 12px;
  align-items: center;
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

@media (max-width: 900px) {
  .filters__row {
    grid-template-columns: 1fr;
  }
}
</style>
