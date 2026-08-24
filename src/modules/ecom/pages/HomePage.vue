<template>
  <section class="storefront">
    <div class="container hero">
      <div class="hero__content">
        <span class="eyebrow">NUEVA TEMPORADA</span>
        <h1>Nueva colección <span>urbana</span></h1>
        <p>Diseño, confort y estilo para todos los días. Descubrí lo último en zapatillas y streetwear.</p>
        <div class="hero__actions">
          <a href="#productos" class="btn btn-primary">Comprar ahora →</a>
          <a href="#productos" class="btn btn-secondary">Ver catálogo</a>
        </div>
      </div>
    </div>

    <div id="productos" class="container products-head">
      <div>
        <h2>Productos destacados</h2>
        <p>Deslizá para seguir viendo más productos.</p>
      </div>
      <button class="filter-toggle" type="button" @click="filtersOpen = !filtersOpen">Filtros</button>
    </div>

    <div v-if="filtersOpen" class="container filters card">
      <input v-model="q" class="input" type="search" placeholder="Buscar por nombre, SKU o descripción…" @keyup.enter="fetchCatalog">
      <select v-model="category" class="input" @change="fetchCatalog">
        <option value="">Todas las categorías</option>
        <option v-for="c in categories" :key="c.id" :value="c.slug">{{ c.name }}</option>
      </select>
      <button class="btn btn-primary btn-sm" :disabled="loading" @click="fetchCatalog">Buscar</button>
    </div>

    <div class="container">
      <div v-if="loading && !products.length" class="status card">Cargando catálogo…</div>
      <div v-else-if="!products.length" class="status card">No hay productos con esos filtros.</div>
      <div v-else class="product-grid">
        <ProductCard v-for="p in visibleProducts" :key="p.id" :product="p" @add="addToCart" />
      </div>
      <div v-if="hasMore" ref="loadMoreTrigger" class="load-more">
        <span class="spinner" /> Cargando más productos...
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/modules/ecom/components/ProductCard.vue'
import { ecomApi } from '@/modules/ecom/services/ecomApi'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'

const route = useRoute()
const cart = useEcomCartStore()
const loading = ref(false)
const products = ref([])
const categories = ref([])
const q = ref(String(route.query.q || ''))
const category = ref(String(route.query.category || ''))
const filtersOpen = ref(false)
const visibleCount = ref(8)
const loadMoreTrigger = ref(null)
let observer

const visibleProducts = computed(() => products.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < products.value.length)

const observeLoader = async () => {
  await nextTick()
  observer?.disconnect()
  if (!loadMoreTrigger.value || !hasMore.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) visibleCount.value = Math.min(visibleCount.value + 8, products.value.length)
  }, { rootMargin: '300px' })
  observer.observe(loadMoreTrigger.value)
}

const fetchCatalog = async () => {
  loading.value = true
  try {
    const response = await ecomApi.getCatalog({ q: q.value || undefined, category: category.value || undefined })
    products.value = response.products || []
    categories.value = response.categories || []
    visibleCount.value = 8
  } finally {
    loading.value = false
    observeLoader()
  }
}

const addToCart = async (product) => {
  cart.addProduct(product, 1)
  await cart.refreshQuote()
}

watch(visibleCount, observeLoader)
watch(() => route.query, () => {
  q.value = String(route.query.q || '')
  category.value = String(route.query.category || '')
  fetchCatalog()
})

onMounted(async () => { cart.load(); await fetchCatalog() })
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.storefront{background:#fff;min-height:100vh}.hero{margin-top:14px;min-height:330px;border-radius:20px;overflow:hidden;display:flex;align-items:center;background:linear-gradient(90deg,rgba(8,15,33,.95) 0%,rgba(8,15,33,.73) 45%,rgba(8,15,33,.18) 100%),url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1800&q=85') center/cover}.hero__content{padding:42px;max-width:600px;color:white}.eyebrow{font-size:.78rem;font-weight:900;color:#8b7cff}.hero h1{font-size:clamp(2.3rem,5vw,4.4rem);line-height:.96;margin:8px 0 18px}.hero h1 span{display:block;color:#7c5cff}.hero p{color:#e5e7eb;max-width:520px;font-size:1.05rem}.hero__actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.hero__actions .btn-primary{background:linear-gradient(90deg,#4f46e5,#6d28d9);border:0}.products-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding-top:28px;padding-bottom:14px}.products-head h2{margin-bottom:2px}.products-head p{margin:0}.filter-toggle{border:0;background:transparent;color:#4f46e5;font-weight:900;cursor:pointer}.filters{display:grid;grid-template-columns:2fr 1fr auto;gap:10px;padding:14px;margin-bottom:16px}.input{width:100%;min-height:44px;border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:#fff}.product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.status{padding:18px}.load-more{min-height:100px;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:800;color:var(--text-muted)}.spinner{width:20px;height:20px;border:2px solid #ddd;border-top-color:#4f46e5;border-radius:50%;animation:spin .75s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:1000px){.product-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.hero{margin-top:10px;min-height:340px;background-position:65% center}.hero__content{padding:26px 24px}.hero h1{font-size:2.55rem}.hero p{max-width:300px}.products-head{padding-top:20px}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.filters{grid-template-columns:1fr}.container{padding-left:12px;padding-right:12px}}
</style>