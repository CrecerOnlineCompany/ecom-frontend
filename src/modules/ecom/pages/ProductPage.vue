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
      Cargando producto…
    </div>
    <div
      v-else-if="error"
      class="card card--error"
    >
      {{ error }}
    </div>

    <div
      v-else-if="product"
      class="product"
    >
      <div class="product__media card">
        <img
          v-if="product.image_url"
          :src="product.image_url"
          :alt="product.name"
        >
        <div
          v-else
          class="product__placeholder"
        >
          Sin imagen
        </div>
      </div>

      <div class="product__info card">
        <h1 class="product__title">
          {{ product.name }}
        </h1>
        <div class="product__price">
          <Money :amount="displayPrice" />
          <span
            v-if="product.compare_at_price"
            class="product__compare"
          >
            <Money :amount="product.compare_at_price" />
          </span>
        </div>

        <p
          v-if="product.description"
          class="product__desc"
        >
          {{ product.description }}
        </p>

        <div class="product__meta">
          <div v-if="product.sku">
            <strong>SKU:</strong> {{ product.sku }}
          </div>
          <div v-if="product.category?.name">
            <strong>Categoría:</strong> {{ product.category.name }}
          </div>
          <div>
            <strong>Tipo:</strong> {{ product.product_type === 'digital' ? 'Digital' : 'Físico' }}
          </div>
          <div v-if="displayTrackInventory">
            <strong>Stock:</strong> {{ displayInventory }}
          </div>
        </div>

        <div class="product__actions">
          <select
            v-if="variants.length"
            v-model="selectedVariantId"
            class="input"
          >
            <option :value="''">
              Elegí una variante…
            </option>
            <option
              v-for="v in variants"
              :key="v.id"
              :value="String(v.id)"
            >
              {{ v.title }}
            </option>
          </select>
          <QuantityInput
            v-model="qty"
            :max="100"
          />
          <button
            class="btn btn-primary"
            :disabled="!canBuy"
            @click="add"
          >
            {{ canBuy ? 'Agregar al carrito' : 'Sin stock' }}
          </button>
          <RouterLink
            to="/cart"
            class="btn btn-secondary"
          >
            Ir al carrito
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import Money from '@/modules/ecom/components/Money.vue'
import QuantityInput from '@/modules/ecom/components/QuantityInput.vue'
import { ecomApi } from '@/modules/ecom/services/ecomApi'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'

const route = useRoute()
const cart = useEcomCartStore()

const loading = ref(false)
const error = ref('')
const product = ref(null)
const qty = ref(1)
const selectedVariantId = ref('')

const variants = computed(() => {
  const list = product.value?.variants || []
  return Array.isArray(list) ? list.filter((v) => v.is_active) : []
})

const selectedVariant = computed(() => {
  const id = Number(selectedVariantId.value || 0)
  if (!id) return null
  return variants.value.find((v) => Number(v.id) === id) || null
})

const displayPrice = computed(() => Number(selectedVariant.value?.price ?? product.value?.price ?? 0))
const displayTrackInventory = computed(() => {
  const v = selectedVariant.value
  if (v) return Boolean(v.track_inventory)
  return Boolean(product.value?.track_inventory)
})
const displayInventory = computed(() => {
  const v = selectedVariant.value
  if (v) return Number(v.inventory_quantity || 0)
  return Number(product.value?.inventory_quantity || 0)
})

const canBuy = computed(() => {
  if (!product.value?.is_active) return false
  if (variants.value.length && !selectedVariant.value) return false

  const q = Number(qty.value || 1)
  if (selectedVariant.value) {
    if (!selectedVariant.value.track_inventory) return true
    return Number(selectedVariant.value.inventory_quantity || 0) >= q
  }

  if (!product.value?.track_inventory) return true
  return Number(product.value?.inventory_quantity || 0) >= q
})

const fetchProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await ecomApi.getProduct(route.params.slug)
    product.value = response.product
    selectedVariantId.value = ''
  } catch {
    error.value = 'No se pudo cargar el producto.'
  } finally {
    loading.value = false
  }
}

const add = async () => {
  if (!product.value) return
  cart.addProduct(product.value, qty.value, selectedVariant.value)
  await cart.refreshQuote()
}

onMounted(() => {
  cart.load()
  fetchProduct()
})

watch(() => route.params.slug, fetchProduct)
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

.product {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 18px;
}

.product__media {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.product__media img {
  width: 100%;
  height: 100%;
  max-height: 520px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.product__placeholder {
  color: var(--text-muted);
  font-weight: 800;
}

.product__info {
  padding: 18px;
}

.product__title {
  margin-bottom: 10px;
}

.product__price {
  display: flex;
  gap: 12px;
  align-items: baseline;
  font-weight: 900;
  font-size: 1.35rem;
  margin-bottom: 12px;
}

.product__compare {
  color: var(--text-muted);
  text-decoration: line-through;
  font-weight: 800;
  font-size: 1rem;
}

.product__desc {
  margin: 8px 0 14px;
  color: var(--text-secondary);
}

.product__meta {
  display: grid;
  gap: 8px;
  color: var(--text-muted);
  margin: 14px 0 18px;
}

.product__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.input {
  width: 260px;
  min-height: 48px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  padding: 10px 12px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .product {
    grid-template-columns: 1fr;
  }
}
</style>
