<template>
  <article class="card product-card">
    <RouterLink
      class="product-card__media"
      :to="`/products/${product.slug}`"
    >
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
      >
      <div
        v-else
        class="product-card__placeholder"
      >
        Sin imagen
      </div>
    </RouterLink>

    <div class="product-card__body">
      <RouterLink
        class="product-card__title"
        :to="`/products/${product.slug}`"
      >
        {{ product.name }}
      </RouterLink>
      <div class="product-card__meta">
        <span v-if="product.category?.name">{{ product.category.name }}</span>
        <span v-if="product.sku">SKU: {{ product.sku }}</span>
      </div>
      <div class="product-card__price">
        <Money :amount="product.price" />
        <span
          v-if="product.compare_at_price"
          class="product-card__compare"
        >
          <Money :amount="product.compare_at_price" />
        </span>
      </div>
    </div>

    <div class="product-card__actions">
      <RouterLink
        v-if="hasVariants"
        class="btn btn-secondary btn-sm"
        :to="`/products/${product.slug}`"
      >
        Elegir opciones
      </RouterLink>
      <button
        v-else
        class="btn btn-primary btn-sm"
        :disabled="!canBuy"
        @click="$emit('add', product)"
      >
        {{ canBuy ? 'Agregar al carrito' : 'Sin stock' }}
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Money from '@/modules/ecom/components/Money.vue'

const props = defineProps({
  product: { type: Object, required: true },
})

defineEmits(['add'])

const hasVariants = computed(() => Array.isArray(props.product?.variant_options) && props.product.variant_options.length > 0)

const canBuy = computed(() => {
  if (!props.product?.is_active) return false
  if (!props.product?.track_inventory) return true
  return Number(props.product?.inventory_quantity || 0) > 0
})
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
}

.product-card__media {
  border-radius: var(--border-radius);
  overflow: hidden;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__placeholder {
  color: var(--text-muted);
  font-weight: 700;
}

.product-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-card__title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.2;
}

.product-card__meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.product-card__price {
  display: flex;
  gap: 12px;
  align-items: baseline;
  font-weight: 900;
  color: var(--text-primary);
  font-size: 1.15rem;
}

.product-card__compare {
  font-weight: 800;
  color: var(--text-muted);
  text-decoration: line-through;
  font-size: 0.95rem;
}

.product-card__actions {
  margin-top: auto;
}
</style>
