<template>
  <section class="container">
    <div class="page-head">
      <div>
        <h1 class="page-title">
          Checkout
        </h1>
        <p class="page-subtitle">
          Datos del cliente y pago.
        </p>
      </div>
      <RouterLink
        to="/cart"
        class="btn btn-secondary btn-sm"
      >
        Volver al carrito
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
      class="checkout"
    >
      <div class="checkout__left">
        <div class="card checkout-card">
          <h2 class="checkout-card__title">
            Contacto
          </h2>
          <div class="form-grid">
            <input
              v-model="form.customer_name"
              class="input"
              type="text"
              placeholder="Nombre completo"
            >
            <input
              v-model="form.customer_email"
              class="input"
              type="email"
              placeholder="Email"
            >
            <input
              v-model="form.customer_phone"
              class="input"
              type="text"
              placeholder="Teléfono (opcional)"
            >
          </div>
        </div>

        <div
          v-if="requiresShipping"
          class="card checkout-card"
        >
          <h2 class="checkout-card__title">
            Dirección de envío
          </h2>
          <label class="checkbox">
            <input
              v-model="shippingSameAsBilling"
              type="checkbox"
            >
            <span>Usar la misma dirección que facturación</span>
          </label>

          <div
            v-if="!shippingSameAsBilling"
            class="form-grid"
          >
            <input
              v-model="shipping.name"
              class="input"
              type="text"
              placeholder="Nombre"
            >
            <input
              v-model="shipping.phone"
              class="input"
              type="text"
              placeholder="Teléfono (opcional)"
            >
            <input
              v-model="shipping.address1"
              class="input"
              type="text"
              placeholder="Dirección"
            >
            <input
              v-model="shipping.city"
              class="input"
              type="text"
              placeholder="Ciudad"
            >
            <input
              v-model="shipping.province"
              class="input"
              type="text"
              placeholder="Provincia (opcional)"
            >
            <input
              v-model="shipping.postal_code"
              class="input"
              type="text"
              placeholder="Código postal"
            >
            <input
              v-model="shipping.country"
              class="input"
              type="text"
              placeholder="País"
            >
          </div>
        </div>

        <div
          v-if="requiresShipping"
          class="card checkout-card"
        >
          <h2 class="checkout-card__title">
            Método de envío
          </h2>

          <div
            v-if="shippingMethodsLoading"
            class="select-grid"
          >
            <div class="select-card select-card--skeleton" />
            <div class="select-card select-card--skeleton" />
          </div>

          <div
            v-else
            class="select-grid"
          >
            <button
              v-for="m in shippingMethods"
              :key="m.code"
              type="button"
              class="select-card"
              :class="{ 'select-card--active': m.code === shippingMethod }"
              @click="shippingMethod = m.code"
            >
              <div class="select-card__title">
                {{ m.name }}
              </div>
              <div class="select-card__meta">
                <span class="select-card__price">{{ formatMoney(m.amount) }}</span>
                <span
                  v-if="m.eta_days !== null"
                  class="select-card__eta"
                >Entrega: {{ m.eta_days }}d</span>
              </div>
            </button>
          </div>
        </div>

        <div class="card checkout-card">
          <h2 class="checkout-card__title">
            Pago
          </h2>
          <div class="select-grid">
            <button
              v-for="p in paymentProviders"
              :key="p.value"
              type="button"
              class="select-card"
              :class="{ 'select-card--active': p.value === form.payment_method }"
              @click="form.payment_method = p.value"
            >
              <div class="select-card__title">
                {{ p.label }}
              </div>
              <div class="select-card__meta">
                <span class="select-card__eta">{{ p.description }}</span>
              </div>
            </button>
          </div>

          <div class="checkout__payment-details">
            <p v-if="form.payment_method === 'cash'">
              Pagás en efectivo al recibir o coordinando por WhatsApp.
            </p>
            <p v-else-if="form.payment_method === 'mercado_pago'">
              Te vamos a redirigir a Mercado Pago para completar el pago de forma segura.
            </p>
            <p v-else>
              Seleccioná un método de pago.
            </p>
          </div>
        </div>

        <div class="card checkout-card">
          <h2 class="checkout-card__title">
            Facturación
          </h2>
          <div class="form-grid">
            <input
              v-model="billing.name"
              class="input"
              type="text"
              placeholder="Nombre / Razón social"
            >
            <input
              v-model="billing.phone"
              class="input"
              type="text"
              placeholder="Teléfono (opcional)"
            >
            <input
              v-model="billing.address1"
              class="input"
              type="text"
              placeholder="Dirección"
            >
            <input
              v-model="billing.city"
              class="input"
              type="text"
              placeholder="Ciudad"
            >
            <input
              v-model="billing.province"
              class="input"
              type="text"
              placeholder="Provincia (opcional)"
            >
            <input
              v-model="billing.postal_code"
              class="input"
              type="text"
              placeholder="Código postal"
            >
            <input
              v-model="billing.country"
              class="input"
              type="text"
              placeholder="País"
            >
          </div>
        </div>

        <div class="card checkout-card">
          <button
            class="btn btn-primary checkout__submit"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? 'Procesando…' : 'Pagar ahora' }}
          </button>

          <p
            v-if="error"
            class="checkout__error"
          >
            {{ error }}
          </p>
        </div>
      </div>

      <aside class="checkout__right">
        <div class="card checkout-card checkout__summary">
          <h2 class="checkout-card__title">
            Resumen
          </h2>
          <div
            v-for="line in cart.items"
            :key="`${line.product_id}-${line.variant_id || 0}`"
            class="summary-line"
          >
            <div class="summary-line__thumb">
              <img
                v-if="line.image_url"
                :src="line.image_url"
                :alt="line.name"
              >
              <div
                v-else
                class="summary-line__placeholder"
              >
                Sin imagen
              </div>
              <span class="summary-line__qty">{{ line.quantity }}</span>
            </div>

            <div class="summary-line__info">
              <div class="summary-line__title">
                {{ line.name }}
              </div>
              <div
                v-if="line.variant_title"
                class="summary-line__variant"
              >
                {{ line.variant_title }}
              </div>
            </div>

            <div class="summary-line__price">
              <Money :amount="Number(line.price) * Number(line.quantity)" />
            </div>
          </div>

          <div class="checkout__divider" />
          <div class="checkout__row">
            <span>Subtotal</span>
            <Money :amount="subtotalValue" />
          </div>
          <div class="checkout__row">
            <span>Descuento</span>
            <Money :amount="-discountValue" />
          </div>
          <div
            v-if="requiresShipping"
            class="checkout__row"
          >
            <span>Envío</span>
            <Money :amount="shippingValue" />
          </div>
          <div class="checkout__row checkout__row--total">
            <span>Total</span>
            <Money :amount="totalValue" />
          </div>

          <div
            v-if="cart.discountCode"
            class="checkout__hint"
          >
            Cupón aplicado: <strong>{{ cart.discountCode }}</strong>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Money from '@/modules/ecom/components/Money.vue'
import { ecomApi } from '@/modules/ecom/services/ecomApi'
import { useEcomCartStore } from '@/modules/ecom/stores/cartStore'
import appConfig from '@/config/appConfig'

const router = useRouter()
const cart = useEcomCartStore()

const submitting = ref(false)
const error = ref('')
const paymentProviders = ref([
  { value: 'cash', label: 'Efectivo', description: 'Pagás al recibir / coordinar.' },
  { value: 'mercado_pago', label: 'Mercado Pago', description: 'Redirección segura para pagar.' },
])

const shippingMethods = ref([])
const shippingMethodsLoading = ref(false)
const shippingMethod = ref('pickup')

const form = reactive({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  payment_method: 'cash',
})

const billing = reactive({
  name: '',
  address1: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'AR',
  phone: '',
})

const shipping = reactive({
  name: '',
  address1: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'AR',
  phone: '',
})

const shippingSameAsBilling = ref(true)

const subtotalValue = computed(() => Number(cart.quote?.subtotal ?? cart.subtotal))
const discountValue = computed(() => Number(cart.quote?.discount_amount ?? 0))
const shippingValue = computed(() => Number(cart.quote?.shipping_amount ?? 0))
const totalValue = computed(() => Number(cart.quote?.total ?? cart.subtotal))
const requiresShipping = computed(() => Boolean(cart.quote?.requires_shipping))
const emptyMessage = computed(() => appConfig?.messages?.emptyCart || 'Tu carrito está vacío.')

const formatMoney = (amount) => {
  const value = Number(amount || 0)
  try {
    return new Intl.NumberFormat(appConfig?.app?.locale || 'es-AR', {
      style: 'currency',
      currency: appConfig?.app?.currency || 'ARS',
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

const computeShippingAddressPayload = () => {
  if (!requiresShipping.value) return null
  return shippingSameAsBilling.value ? { ...billing } : { ...shipping }
}

const refreshCheckoutQuote = async () => {
  await cart.refreshQuote({
    shipping_method: requiresShipping.value ? shippingMethod.value : undefined,
    shipping_address: computeShippingAddressPayload(),
  })
}

const refreshShippingMethods = async () => {
  if (!requiresShipping.value) {
    shippingMethods.value = []
    return
  }

  shippingMethodsLoading.value = true
  try {
    const response = await ecomApi.quoteShipping({
      items: cart.items.map((line) => ({
        product_id: line.product_id,
        variant_id: line.variant_id || undefined,
        quantity: line.quantity,
      })),
      shipping_address: computeShippingAddressPayload(),
    })

    shippingMethods.value = response.methods || []
    if (shippingMethods.value.length) {
      const exists = shippingMethods.value.find((m) => m.code === shippingMethod.value)
      if (!exists) {
        shippingMethod.value = shippingMethods.value[0].code
      }
    }
  } catch {
    // ignore
  } finally {
    shippingMethodsLoading.value = false
  }
}

let refreshTimer = null
const scheduleRefresh = () => {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(async () => {
    await refreshShippingMethods()
    await refreshCheckoutQuote()
  }, 250)
}

const submit = async () => {
  error.value = ''
  if (!form.customer_name || !form.customer_email) {
    error.value = 'Completá nombre y email.'
    return
  }
  if (!billing.name || !billing.address1 || !billing.city || !billing.postal_code || !billing.country) {
    error.value = 'Completá los datos de facturación.'
    return
  }
  if (requiresShipping.value) {
    if (!shippingMethod.value) {
      error.value = 'Elegí un método de envío.'
      return
    }
    const ship = computeShippingAddressPayload()
    if (!ship?.address1 || !ship?.city || !ship?.postal_code || !ship?.country) {
      error.value = 'Completá los datos de envío.'
      return
    }
  }

  submitting.value = true
  try {
    const shippingPayload = computeShippingAddressPayload()

    const response = await ecomApi.checkout({
      ...form,
      discount_code: cart.discountCode || undefined,
      items: cart.items.map((line) => ({
        product_id: line.product_id,
        variant_id: line.variant_id || undefined,
        quantity: line.quantity,
      })),
      billing_address: { ...billing, name: billing.name || form.customer_name },
      shipping_same_as_billing: Boolean(shippingSameAsBilling.value),
      shipping_address: shippingPayload,
      shipping_method: requiresShipping.value ? shippingMethod.value : undefined,
    })

    const orderNumber = response.order?.order_number
    if (orderNumber) {
      cart.setLastOrderNumber(orderNumber)
    }

    if (response.payment?.requires_redirect && response.payment?.redirect_url) {
      cart.clear()
      window.location.href = response.payment.redirect_url
      return
    }

    cart.clear()
    router.push(`/orders/${encodeURIComponent(orderNumber)}`)
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo completar el checkout.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  cart.load()
  await cart.refreshQuote()

  try {
    const response = await ecomApi.getPaymentMethods()
    const providers = response.methods || []
    const supported = providers
      .filter((p) => ['cash', 'mercado_pago'].includes(p.name))
      .map((p) => ({
        value: p.name,
        label: p.display_name || p.name,
        description: p.description || '',
      }))
    if (supported.length) {
      paymentProviders.value = supported
      if (!supported.find((m) => m.value === form.payment_method)) {
        form.payment_method = supported[0].value
      }
    }
  } catch {
    // keep defaults
  }

  await refreshShippingMethods()
  await refreshCheckoutQuote()
})

watch(() => requiresShipping.value, scheduleRefresh)
watch(() => shippingSameAsBilling.value, scheduleRefresh)
watch(() => shippingMethod.value, scheduleRefresh)
watch(() => billing.address1, scheduleRefresh)
watch(() => billing.city, scheduleRefresh)
watch(() => billing.postal_code, scheduleRefresh)
watch(() => billing.country, scheduleRefresh)
watch(() => shipping.address1, scheduleRefresh)
watch(() => shipping.city, scheduleRefresh)
watch(() => shipping.postal_code, scheduleRefresh)
watch(() => shipping.country, scheduleRefresh)
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

.checkout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  align-items: start;
}

.checkout__left,
.checkout__right {
  display: grid;
  gap: 16px;
}

.checkout__form {
  padding: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkout-card {
  padding: 16px;
}

.select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.select-card {
  position: relative;
  overflow: hidden;
  text-align: left;
  width: 100%;
  border-radius: var(--border-radius);
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 14px;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-primary);
  -webkit-tap-highlight-color: transparent;
}

.select-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.select-card:focus-visible {
  outline: 2px solid rgba(17, 24, 39, 0.45);
  outline-offset: 2px;
}

.select-card--active {
  border-color: var(--border-strong);
  background: var(--surface-alt);
}

.select-card--active::after {
  content: '';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.12);
}

.select-card--skeleton {
  min-height: 74px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.03));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.select-card__title {
  font-weight: 900;
  margin-bottom: 6px;
}

.select-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-muted);
  font-weight: 700;
}

.select-card__price {
  color: var(--text-primary);
  font-weight: 900;
}

.checkout__summary {
  position: sticky;
  top: 84px;
}

.checkout__payment-details p:last-child {
  margin-bottom: 0;
}

.checkout__payment-details {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
}

.checkout__submit {
  width: 100%;
}

.checkout__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-secondary);
  font-weight: 700;
  margin: 10px 0;
}

.checkout__row-title {
  max-width: 70%;
}

.muted {
  color: var(--text-muted);
  font-weight: 800;
}

.checkout__divider {
  margin: 12px 0;
  border-top: 1px solid var(--border);
}

.checkout__row--total {
  color: var(--text-primary);
  font-weight: 900;
  font-size: 1.1rem;
}

.checkout__error {
  margin-top: 10px;
  color: #991b1b;
  font-weight: 700;
}

.checkout__hint {
  margin-top: 12px;
  color: var(--text-muted);
  font-weight: 700;
}

.checkbox {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--text-secondary);
  font-weight: 700;
  margin: 10px 0 12px;
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

.summary-line {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
}

.summary-line__thumb {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-line__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-line__placeholder {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
}

.summary-line__qty {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--text-primary);
  color: #ffffff;
  border: 2px solid var(--surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.summary-line__info {
  min-width: 0;
}

.summary-line__title {
  font-weight: 900;
  line-height: 1.2;
  color: var(--text-primary);
}

.summary-line__variant {
  margin-top: 2px;
  font-weight: 700;
  color: var(--text-muted);
  font-size: 0.92rem;
}

.summary-line__price {
  font-weight: 900;
  color: var(--text-primary);
}

@media (max-width: 960px) {
  .checkout {
    grid-template-columns: 1fr;
  }

  .checkout__summary {
    position: static;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .select-grid {
    grid-template-columns: 1fr;
  }
}
</style>
