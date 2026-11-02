<template>
  <article class="product-card">
    <RouterLink class="product-card__media" :to="`/products/${product.slug}`">
      <span v-if="product.compare_at_price" class="product-card__badge">Oferta</span>
      <span class="product-card__heart" aria-hidden="true">♡</span>
      <img v-if="product.image_url" :src="product.image_url" :alt="product.name">
      <div v-else class="product-card__placeholder">Sin imagen</div>
    </RouterLink>
    <div class="product-card__body">
      <span v-if="product.category?.name" class="product-card__category">{{ product.category.name }}</span>
      <RouterLink class="product-card__title" :to="`/products/${product.slug}`">{{ product.name }}</RouterLink>
      <div class="product-card__price">
        <Money :amount="product.price" />
        <span v-if="product.compare_at_price" class="product-card__compare"><Money :amount="product.compare_at_price" /></span>
      </div>
      <RouterLink v-if="hasVariants" class="btn btn-primary btn-sm product-card__button" :to="`/products/${product.slug}`">Elegir opciones</RouterLink>
      <button v-else class="btn btn-primary btn-sm product-card__button" :disabled="!canBuy" @click="$emit('add', product)">{{ canBuy ? 'Agregar' : 'Sin stock' }}</button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Money from '@/modules/ecom/components/Money.vue'

const props = defineProps({ product: { type: Object, required: true } })
defineEmits(['add'])
const hasVariants = computed(() => Array.isArray(props.product?.variant_options) && props.product.variant_options.length > 0)
const canBuy = computed(() => !props.product?.track_inventory || Number(props.product?.inventory_quantity || 0) > 0)
</script>

<style scoped>
.product-card{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;min-width:0;transition:.2s ease}.product-card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}.product-card__media{position:relative;aspect-ratio:1/1;background:#fafafa;display:grid;place-items:center;overflow:hidden}.product-card__media img{width:100%;height:100%;object-fit:contain;padding:16px}.product-card__badge{position:absolute;left:10px;top:10px;background:#e11d48;color:#fff;border-radius:8px;padding:4px 8px;font-size:.75rem;font-weight:900}.product-card__heart{position:absolute;right:12px;top:8px;font-size:1.45rem;color:#64748b}.product-card__placeholder{color:var(--text-muted);font-weight:700}.product-card__body{padding:14px;display:flex;flex-direction:column;gap:6px;flex:1}.product-card__category{font-size:.8rem;color:#4f46e5;font-weight:800}.product-card__title{font-weight:800;line-height:1.25;min-height:2.5em}.product-card__price{display:flex;align-items:baseline;gap:8px;font-size:1.05rem;font-weight:900}.product-card__compare{font-size:.85rem;color:var(--text-muted);text-decoration:line-through}.product-card__button{width:100%;margin-top:auto;background:linear-gradient(90deg,#4f46e5,#6d28d9);border:0}@media(max-width:560px){.product-card__body{padding:10px}.product-card__media img{padding:8px}.product-card__title{font-size:.9rem}.product-card__price{font-size:.95rem}.product-card__button{min-height:38px;padding:9px;font-size:.82rem}}
</style>