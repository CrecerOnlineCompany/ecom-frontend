<template>
  <section class="container">
    <div class="page-head">
      <div>
        <h1 class="page-title">
          Carrito
        </h1>
        <p
          v-if="cart.items.length"
          class="page-subtitle"
        >
          {{ cart.totalItems }} item(s) en el carrito.
        </p>
      </div>
      <RouterLink
        to="/"
        class="btn btn-secondary btn-sm"
      >
        Seguir comprando
      </RouterLink>
    </div>

    <div
      v-if="!cart.items.length"
      class="card"
    >
      <p>{{ emptyMessage }}</p>
      <RouterLink
        to="/"
        class="btn btn-primary"
      >
        Ver productos
      </RouterLink>
    </div>

    <div
      v-else
      class="cart"
    >
      <div class="cart__items">
        <article
          v-for="line in cart.items"
          :key="`${line.product_id}-${line.variant_id || 0}`"
          class="card cart-line"
        >
          <div class="cart-line__media">
            <img
              v-if="line.image_url"
              :src="line.image_url"
              :alt="line.name"
            >
            <div
              v-else
              class="cart-line__placeholder"
            >
              Sin imagen
            </div>
          </div>

          <div class="cart-line__info">
            <RouterLink
              v-if="line.slug"
              class="cart-line__title"
              :to="`/products/${line.slug}`"
            >
              {{ line.name }}
              <span
                v-if="line.variant_title"
                class="cart-line__variant"
              > — {{ line.variant_title }}</span>
            </RouterLink>
            <div
              v-else
              class="cart-line__title"
            >
              {{ line.name }}
            </div>
            <div class="cart-line__meta">
              <Money :amount="line.price" />
              <span class="cart-line__muted">c/u</span>
            </div>
          </div>

          <div class="cart-line__qty">
            <QuantityInput
              :model-value="line.quantity"
              @update:model-value="(v) => onQty(line.product_id, v, line.variant_id)"
            />
            <button
              class="btn btn-danger btn-sm"
              @click="remove(line.product_id, line.variant_id)"
            >
              Quitar
            </button>
          </div>
        </article>
      </div>

      <aside class="card cart__summary">
        <h2 class="cart__summary-title">
          Resumen
        </h2>

        <div class="cart__row">
          <span>Subtotal</span>
          <Money :amount="subtotalValue" />
        </div>
        <div class="cart__row">
          <span>Descuento</span>
          <Money :amount="-discountValue" />
        </div>
        <div class="cart__row cart__row--total">
          <span>Total</span>
          <Money :amount="totalValue" />
        </div>

        <div class="cart__discount">
          <input
            v-model="cart.discountCode"
            class="input"
            type="text"
            placeholder="Código de descuento"
          >
          <button
            class="btn btn-secondary btn-sm"
            :disabled="cart.loadingQuote"
            @click="cart.refreshQuote()"
          >
            {{ cart.loadingQuote ? 'Recalculando…' : 'Aplicar' }}
          </button>
        </div>

        <RouterLink
          to="/checkout"
          class="btn btn-primary"
        >
          Continuar al checkout
        </RouterLink>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Money from '@/modules/ecom/components/Money.vue'
import QuantityInput from '@/modules/ecom/components/QuantityInput.vue'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'
import appConfig from '@/config/appConfig'

const cart = useEcomCartStore()

const subtotalValue = computed(() => Number(cart.quote?.subtotal ?? cart.subtotal))
const discountValue = computed(() => Number(cart.quote?.discount_amount ?? 0))
const totalValue = computed(() => Number(cart.quote?.total ?? cart.subtotal))
const emptyMessage = computed(() => appConfig?.messages?.emptyCart || 'Tu carrito está vacío.')

const onQty = async (productId, qty, variantId = null) => {
  cart.updateQuantity(productId, qty, variantId)
  await cart.refreshQuote()
}

const remove = async (productId, variantId = null) => {
  cart.removeProduct(productId, variantId)
  await cart.refreshQuote()
}

onMounted(async () => {
  cart.load()
  await cart.refreshQuote()
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

.cart {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  align-items: start;
}

.cart-line {
  display: grid;
  grid-template-columns: 92px 1fr auto;
  gap: 14px;
  padding: 14px;
}

.cart-line__media {
  width: 92px;
  height: 92px;
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-line__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-line__placeholder {
  color: var(--text-muted);
  font-weight: 800;
  font-size: 0.85rem;
}

.cart-line__title {
  color: var(--text-primary);
  font-weight: 900;
  display: block;
  margin-bottom: 6px;
}

.cart-line__variant {
  color: var(--text-muted);
  font-weight: 800;
}

.cart-line__meta {
  display: flex;
  gap: 10px;
  color: var(--text-secondary);
  font-weight: 700;
}

.cart-line__muted {
  color: var(--text-muted);
  font-weight: 700;
}

.cart-line__qty {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart__summary {
  position: sticky;
  top: 84px;
  padding: 16px;
}

.cart__summary-title {
  margin-bottom: 14px;
}

.cart__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  color: var(--text-secondary);
  font-weight: 700;
}

.cart__row--total {
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 900;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.cart__discount {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin: 14px 0;
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

@media (max-width: 960px) {
  .cart {
    grid-template-columns: 1fr;
  }

  .cart__summary {
    position: static;
  }

  .cart-line {
    grid-template-columns: 72px 1fr;
  }

  .cart-line__qty {
    grid-column: 1 / -1;
    justify-content: space-between;
  }
}
</style>
