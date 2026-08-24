<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <RouterLink
        to="/"
        class="app-header__brand"
      >
        Ecom
      </RouterLink>

      <nav class="app-header__nav">
        <RouterLink
          to="/"
          class="app-header__link"
        >
          Tienda
        </RouterLink>
        <RouterLink
          to="/cart"
          class="app-header__link app-header__cart"
        >
          Carrito
          <span
            v-if="cart.totalItems"
            class="app-header__badge"
          >{{ cart.totalItems }}</span>
        </RouterLink>
        <RouterLink
          to="/account"
          class="app-header__link"
        >
          Mi cuenta
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'

const cart = useEcomCartStore()
cart.load()
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(10px);
  background: rgba(246, 246, 247, 0.9);
  border-bottom: 1px solid var(--border);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
}

.app-header__brand {
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.app-header__nav {
  display: flex;
  gap: 10px;
  align-items: center;
}

.app-header__link {
  color: var(--text-secondary);
  padding: 10px 14px;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

.app-header__link:hover,
.app-header__link.router-link-active {
  color: var(--text-primary);
  background: var(--surface-alt);
}

.app-header__cart {
  position: relative;
}

.app-header__badge {
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-size: 12px;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  font-weight: 700;
}
</style>
