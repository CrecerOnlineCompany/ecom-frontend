<template>
  <>
    <div class="announcement">🚚 Envíos a todo el país · 3 cuotas sin interés</div>
    <header class="app-header">
      <div class="container app-header__top">
        <button class="menu-button" type="button" aria-label="Abrir menú">☰</button>
        <RouterLink to="/" class="brand"><span class="brand__mark">E</span><span>Ecom Store</span></RouterLink>
        <div class="search-wrap">
          <span>⌕</span>
          <input v-model="search" type="search" placeholder="Buscar productos..." @keyup.enter="goSearch">
        </div>
        <nav class="actions">
          <RouterLink to="/account" class="action-link">Cuenta</RouterLink>
          <RouterLink to="/cart" class="cart-link">🛒<span v-if="cart.totalItems" class="badge">{{ cart.totalItems }}</span><span class="cart-label">Carrito</span></RouterLink>
        </nav>
      </div>
      <div class="container mobile-search">
        <div class="search-wrap"><span>⌕</span><input v-model="search" type="search" placeholder="Buscar productos..." @keyup.enter="goSearch"></div>
      </div>
      <nav class="container category-nav">
        <RouterLink to="/">Inicio</RouterLink>
        <a href="/?category=zapatillas">Zapatillas</a>
        <a href="/?category=indumentaria">Indumentaria</a>
        <a href="/?category=accesorios">Accesorios</a>
        <a href="/?tag=ofertas" class="offer">Ofertas</a>
      </nav>
    </header>
  </>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'

const cart = useEcomCartStore()
const router = useRouter()
const search = ref('')
cart.load()

const goSearch = () => router.push({ path: '/', query: search.value ? { q: search.value } : {} })
</script>

<style scoped>
.announcement{background:linear-gradient(90deg,#4f46e5,#6d28d9);color:#fff;text-align:center;padding:7px 12px;font-weight:800;font-size:.9rem}.app-header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}.app-header__top{min-height:72px;display:grid;grid-template-columns:auto minmax(280px,1fr) auto;gap:28px;align-items:center}.brand{display:flex;align-items:center;gap:10px;font-size:1.45rem;font-weight:900;color:#312e81;white-space:nowrap}.brand__mark{font-style:italic;font-size:2rem;color:#5b4cf0}.search-wrap{height:46px;border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;gap:10px;padding:0 14px;background:white}.search-wrap input{border:0;outline:0;width:100%;font:inherit;background:transparent}.actions{display:flex;align-items:center;gap:18px}.action-link,.cart-link{font-weight:700;color:var(--text-secondary)}.cart-link{position:relative;display:flex;align-items:center;gap:6px}.badge{position:absolute;top:-12px;left:13px;background:#4f46e5;color:white;border-radius:999px;min-width:20px;height:20px;display:grid;place-items:center;font-size:11px}.category-nav{height:46px;display:flex;justify-content:center;align-items:center;gap:42px;font-weight:700;overflow:auto}.category-nav a.router-link-active{color:#4f46e5;border-bottom:2px solid #4f46e5;height:46px;display:flex;align-items:center}.category-nav .offer{color:#e11d48}.menu-button,.mobile-search{display:none}@media(max-width:760px){.app-header__top{grid-template-columns:auto 1fr auto;gap:10px;min-height:64px}.menu-button{display:block;border:0;background:transparent;font-size:1.4rem}.brand{font-size:1.25rem}.brand__mark{font-size:1.65rem}.search-wrap{display:none}.actions .action-link,.cart-label{display:none}.mobile-search{display:block;padding-bottom:10px}.mobile-search .search-wrap{display:flex}.category-nav{justify-content:flex-start;gap:26px;height:44px;padding-bottom:2px}.category-nav a{white-space:nowrap}.announcement{font-size:.8rem}}
</style>