<template>
  <div v-if="!hideSidebar" class="cart-sidebar-root">
    <button class="cart-fab" type="button" @click="openSidebar">
      <span class="fab-label">Carrito</span>
      <span class="fab-total">${{ cartStore.totalPrice.toFixed(2) }}</span>
      <span v-if="cartStore.items.length > 0" class="fab-count">{{ cartStore.items.length }}</span>
    </button>

    <transition name="sidebar-fade">
      <div v-if="isOpen" class="sidebar-overlay" @click.self="closeSidebar">
        <aside class="sidebar-panel">
          <div class="sidebar-header">
            <h3>Tu carrito</h3>
            <button class="close-btn" type="button" @click="closeSidebar">✕</button>
          </div>
          <Cart @close="closeSidebar" />
        </aside>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import Cart from '@/components/Cart.vue'

const cartStore = useCartStore()
const route = useRoute()
const isOpen = ref(false)

const hiddenRoutes = new Set(['Checkout', 'PaymentSuccess', 'PaymentFailed', 'Confirmation'])
const hideSidebar = computed(() => hiddenRoutes.has(route.name))

const openSidebar = () => {
  isOpen.value = true
}

const closeSidebar = () => {
  isOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false
  }
)
</script>

<style scoped>
.cart-sidebar-root {
  position: fixed;
  right: 1.1rem;
  bottom: 1.2rem;
  z-index: 1200;
}

.cart-fab {
  position: relative;
  border: 1px solid #2f3440;
  background: #12151c;
  color: #f4f7ff;
  border-radius: 12px;
  padding: 0.75rem 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.cart-fab:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.fab-label {
  font-size: 0.86rem;
  color: #96a3b8;
}

.fab-total {
  font-size: 0.94rem;
  font-weight: 700;
  color: #fff;
}

.fab-count {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--primary);
  color: #000;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.35rem;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: flex-end;
}

.sidebar-panel {
  width: min(92vw, 370px);
  height: 100vh;
  background: #12151c;
  border-left: 1px solid #2f3440;
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.sidebar-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: #96a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}

.close-btn:hover {
  color: #fff;
}

.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.2s ease;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .cart-sidebar-root {
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .cart-fab {
    padding: 0.68rem 0.8rem;
  }

  .fab-label {
    display: none;
  }
}
</style>
