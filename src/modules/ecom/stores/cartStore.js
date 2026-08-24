import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ecomApi } from '@/modules/ecom/services/ecomApi'
import { STORAGE_KEYS } from '@/modules/ecom/constants/storage'

export const useEcomCartStore = defineStore('ecomCart', () => {
  const items = ref([])
  const discountCode = ref('')
  const quote = ref(null)
  const loadingQuote = ref(false)
  const lastOrderNumber = ref(localStorage.getItem(STORAGE_KEYS.lastOrderNumber) || '')

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cartItems)
      if (!raw) return
      const parsed = JSON.parse(raw)
      items.value = Array.isArray(parsed) ? parsed : []
    } catch {
      items.value = []
    }
  }

  const persist = () => {
    localStorage.setItem(STORAGE_KEYS.cartItems, JSON.stringify(items.value))
  }

  const setLastOrderNumber = (orderNumber) => {
    lastOrderNumber.value = String(orderNumber || '')
    localStorage.setItem(STORAGE_KEYS.lastOrderNumber, lastOrderNumber.value)
  }

  const normalizeVariantId = (variant) => {
    const id = variant?.id ?? variant?.variant_id ?? null
    const n = id === null || id === undefined ? null : Number(id)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const findLine = (productId, variantId = null) => {
    return items.value.find((line) => {
      return Number(line.product_id) === Number(productId) && Number(line.variant_id || 0) === Number(variantId || 0)
    })
  }

  const addProduct = (product, quantity = 1, variant = null) => {
    const qty = Math.max(1, Number(quantity) || 1)
    const variantId = normalizeVariantId(variant)
    const existing = findLine(product.id, variantId)
    if (existing) {
      existing.quantity += qty
    } else {
      items.value.push({
        product_id: product.id,
        variant_id: variantId,
        variant_title: variant?.title || null,
        slug: product.slug,
        name: product.name,
        image_url: product.image_url,
        price: Number(variant?.price ?? product.price),
        quantity: qty,
      })
    }
    persist()
  }

  const removeProduct = (productId, variantId = null) => {
    items.value = items.value.filter((line) => {
      return !(Number(line.product_id) === Number(productId) && Number(line.variant_id || 0) === Number(variantId || 0))
    })
    persist()
  }

  const updateQuantity = (productId, quantity, variantId = null) => {
    const target = findLine(productId, variantId)
    if (!target) return
    target.quantity = Math.max(1, Number(quantity) || 1)
    persist()
  }

  const clear = () => {
    items.value = []
    quote.value = null
    discountCode.value = ''
    persist()
  }

  const subtotal = computed(() => {
    return items.value.reduce((sum, line) => sum + (Number(line.price) * Number(line.quantity)), 0)
  })

  const totalItems = computed(() => {
    return items.value.reduce((sum, line) => sum + Number(line.quantity), 0)
  })

  const refreshQuote = async (options = {}) => {
    if (!items.value.length) {
      quote.value = null
      return
    }

    loadingQuote.value = true
    try {
      const response = await ecomApi.quote({
        items: items.value.map((line) => ({
          product_id: line.product_id,
          variant_id: line.variant_id || undefined,
          quantity: line.quantity,
        })),
        discount_code: discountCode.value || undefined,
        ...(options || {}),
      })
      quote.value = response
    } finally {
      loadingQuote.value = false
    }
  }

  return {
    items,
    discountCode,
    quote,
    loadingQuote,
    lastOrderNumber,
    subtotal,
    totalItems,
    load,
    addProduct,
    removeProduct,
    updateQuantity,
    clear,
    refreshQuote,
    setLastOrderNumber,
  }
})
