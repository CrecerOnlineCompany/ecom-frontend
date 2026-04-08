<template>
  <div class="cart-container">
    <div class="cart-header">
      <h3>Carrito</h3>
      <span v-if="cartStore.items.length > 0" class="cart-count">
        {{ cartStore.items.length }}
      </span>
    </div>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Tu carrito está vacío</p>
      <p class="subtitle">Selecciona asientos para comenzar</p>
    </div>

    <div v-else class="cart-content">
      <!-- Items List -->
      <div class="cart-items">
        <div 
          v-for="item in cartStore.items" 
          :key="item.id"
          class="cart-item"
        >
          <div class="item-info">
            <div class="item-seat">
              {{ getCartSeatLabel(item) }}
              <span v-if="item.is_vip" class="vip-badge">VIP</span>
            </div>
            <div class="item-price">{{ item.price }}$</div>
          </div>
          <button 
            @click="cartStore.removeItem(item.id)"
            class="remove-btn"
            title="Eliminar"
          >
            ✕
          </button>
        </div>

        <div
          v-for="product in cartProducts"
          :key="`product-${product.code}`"
          class="cart-item product-item"
        >
          <div class="item-info">
            <div class="item-seat">
              {{ product.name }}
              <span class="product-qty">x{{ product.quantity }}</span>
            </div>
            <div class="item-price">
              <template v-if="product.subtotal !== null">{{ product.subtotal.toFixed(2) }}$</template>
              <template v-else>Adicional</template>
            </div>
          </div>
          <button
            @click="cartStore.updateSelectedProduct(product.code, 0)"
            class="remove-btn"
            title="Eliminar producto"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="cart-summary">
        <div class="summary-row">
          <span>Entradas:</span>
          <span>{{ cartStore.items.length }}</span>
        </div>
        <div v-if="vipCount > 0" class="summary-row">
          <span>VIP:</span>
          <span>{{ vipCount }}</span>
        </div>
        <div v-if="totalProductUnits > 0" class="summary-row">
          <span>Adicionales:</span>
          <span>{{ totalProductUnits }}</span>
        </div>
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>{{ cartStore.effectiveBaseSubtotal.toFixed(2) }}$</span>
        </div>
        <div v-if="cartStore.effectiveTotalDiscount > 0" class="summary-row discount">
          <span>Descuento promo:</span>
          <span>-{{ cartStore.effectiveTotalDiscount.toFixed(2) }}$</span>
        </div>
        <div
          v-for="promo in cartStore.appliedPromotions"
          :key="promo.promotion_id || promo.code || promo.name"
          class="summary-row promo"
        >
          <span>{{ promo.name || promo.code || 'Promoción' }}</span>
          <span>-{{ Number(promo.discount_amount || 0).toFixed(2) }}$</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>{{ cartStore.effectiveTotalPrice.toFixed(2) }}$</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="cart-actions">
        <router-link 
          to="/checkout" 
          class="btn btn-primary"
          @click="$emit('close')"
        >
          Ir a Pagar
        </router-link>
        <button 
          @click="cartStore.clearCart"
          class="btn-secondary"
        >
          Vaciar Carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()

defineEmits(['close'])

const vipCount = computed(() => {
  return cartStore.items.filter(item => item.is_vip).length
})

const cartProducts = computed(() => {
  const selected = Array.isArray(cartStore.selectedProducts) ? cartStore.selectedProducts : []
  const quoteItems = Array.isArray(cartStore.pricingQuote?.order_items)
    ? cartStore.pricingQuote.order_items
    : []

  const productItemsMap = new Map(
    quoteItems
      .filter(item => ['product', 'combo'].includes(String(item?.item_type || '').toLowerCase()))
      .map(item => [
        String(item?.item_code || '').toUpperCase(),
        {
          name: item?.description || String(item?.item_code || 'Producto'),
          subtotal: Number.isFinite(Number(item?.subtotal)) ? Number(item.subtotal) : null
        }
      ])
  )

  return selected.map(product => {
    const code = String(product?.code || '').toUpperCase()
    const quoteProduct = productItemsMap.get(code)
    return {
      code,
      quantity: Number(product?.quantity) || 0,
      name: quoteProduct?.name || code || 'Producto',
      subtotal: quoteProduct?.subtotal ?? null
    }
  })
})

const totalProductUnits = computed(() => {
  return cartProducts.value.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0)
})

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['1', 'true', 'yes', 'si', 'sí'].includes(normalized)
  }
  return false
}

const getCartSeatLabel = (item) => {
  return normalizeBoolean(item?.non_number) ? 'S/N' : (item?.seat_label || 'N/A')
}
</script>

<style scoped>
.cart-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #3d3d3d;
  margin-bottom: 1rem;
}

.cart-header h3 {
  margin: 0;
  color: var(--primary);
}

.cart-count {
  background: var(--primary);
  color: #000;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.empty-cart {
  text-align: center;
  padding: 2rem 0;
  color: #999;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-cart p {
  margin: 0.5rem 0;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
}

.cart-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #3d3d3d;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
}

.cart-item.product-item .item-seat {
  color: #f8fafc;
}

.product-qty {
  background: rgba(59, 130, 246, 0.18);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #bfdbfe;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}

.item-info {
  flex: 1;
}

.item-seat {
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vip-badge {
  background: #ffd700;
  color: #000;
  padding: 0.1rem 0.4rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
}

.item-price {
  color: #ccc;
  font-size: 0.9rem;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.remove-btn:hover {
  color: #ff6b6b;
}

.cart-summary {
  padding: 1rem;
  background: #1a1a1a;
  border: 1px solid #3d3d3d;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #ccc;
}

.summary-row.discount,
.summary-row.promo {
  color: #8be9a8;
}

.summary-row.total {
  border-top: 1px solid #3d3d3d;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-weight: 700;
  color: var(--primary);
  font-size: 1.1rem;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cart-actions a {
  text-decoration: none;
}

@media (max-width: 768px) {
  .cart-container {
    max-height: 400px;
  }
}
</style>
