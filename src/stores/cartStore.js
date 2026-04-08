import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { paymentService } from '@/services/paymentService'

const STORAGE_KEY = 'cinea_cart'
const PAYMENT_SESSION_KEY = 'cinea_payment_session'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const selectedProducts = ref([])
  const screeningId = ref(null)
  const movieInfo = ref(null)
  const paymentSession = ref(null)
  const pricingQuote = ref(null)
  const nowTimestamp = ref(Date.now())
  let clockInterval = null
  let pricingRefreshTimeout = null

  // Cargar datos persistidos del localStorage
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        items.value = data.items || []
        selectedProducts.value = data.selectedProducts || []
        screeningId.value = data.screeningId || null
        movieInfo.value = data.movieInfo || null
        paymentSession.value = data.paymentSession || null
        pricingQuote.value = data.pricingQuote || null
      }
      // Cargar sesión de pago si existe
      const savedSession = localStorage.getItem(PAYMENT_SESSION_KEY)
      if (savedSession) {
        try {
          paymentSession.value = JSON.parse(savedSession)
        } catch (e) {
          console.error('Error loading payment session:', e)
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error)
    }
  }

  // Guardar datos en localStorage
  const saveToStorage = () => {
    try {
      const data = {
        items: items.value,
        selectedProducts: selectedProducts.value,
        screeningId: screeningId.value,
        movieInfo: movieInfo.value,
        paymentSession: paymentSession.value,
        pricingQuote: pricingQuote.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      // Guardar sesión de pago en key separada para recuperación rápida
      if (paymentSession.value) {
        localStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(paymentSession.value))
      } else {
        localStorage.removeItem(PAYMENT_SESSION_KEY)
      }
    } catch (error) {
      console.error('Error saving cart to storage:', error)
    }
  }

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
  })

  const normalizeProducts = (products = []) => {
    return [...products]
      .map(product => ({
        code: String(product?.code || '').trim().toUpperCase(),
        quantity: Number(product?.quantity) || 0
      }))
      .filter(product => product.code && product.quantity > 0)
      .sort((a, b) => a.code.localeCompare(b.code))
  }

  const getCurrentProducts = () => normalizeProducts(selectedProducts.value)

  const normalizeSeatIds = (seatIds = []) => {
    return [...seatIds].map(id => Number(id)).filter(Number.isFinite).sort((a, b) => a - b)
  }

  const getCurrentSeatIds = () => {
    return normalizeSeatIds(
      items.value
        .map(item => item.seat_id ?? item.id)
        .filter(id => id !== null && id !== undefined)
    )
  }

  const totalSeats = computed(() => items.value.length)

  const normalizeScreeningId = (value) => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
  }

  const getUniqueScreeningIds = () => {
    const ids = items.value
      .map(item => normalizeScreeningId(item?.screening_id))
      .filter(id => id !== null)
    return [...new Set(ids)]
  }

  const cartScreeningIds = computed(() => getUniqueScreeningIds())
  const hasMultipleScreenings = computed(() => cartScreeningIds.value.length > 1)
  const currentCartScreeningId = computed(() => {
    return cartScreeningIds.value.length === 1 ? cartScreeningIds.value[0] : null
  })

  const getScreeningConflictMessage = () => {
    return 'Por ahora solo puedes comprar asientos de una función por vez. Vacía el carrito para cambiar de función.'
  }

  const hasQuoteForCurrentSelection = computed(() => {
    if (!pricingQuote.value) return false
    if (hasMultipleScreenings.value) return false
    if (!currentCartScreeningId.value) return false

    const quoteScreeningId = Number(pricingQuote.value.screening_id)
    if (quoteScreeningId !== Number(currentCartScreeningId.value)) return false

    const currentSeatIds = getCurrentSeatIds()
    const quoteSeatIds = normalizeSeatIds(pricingQuote.value.seat_ids || [])
    if (currentSeatIds.length !== quoteSeatIds.length) return false

    const seatsMatch = currentSeatIds.every((seatId, index) => seatId === quoteSeatIds[index])
    if (!seatsMatch) return false

    const currentProducts = getCurrentProducts()
    const quoteProducts = normalizeProducts(pricingQuote.value.products || [])
    if (currentProducts.length !== quoteProducts.length) return false

    return currentProducts.every((product, index) => {
      const quoteProduct = quoteProducts[index]
      return product.code === quoteProduct.code && product.quantity === quoteProduct.quantity
    })
  })

  const effectiveBaseSubtotal = computed(() => {
    if (hasQuoteForCurrentSelection.value) {
      const value = Number(pricingQuote.value?.base_subtotal)
      if (Number.isFinite(value)) return value
    }
    return totalPrice.value
  })

  const effectiveTotalDiscount = computed(() => {
    if (hasQuoteForCurrentSelection.value) {
      const value = Number(pricingQuote.value?.total_discount)
      if (Number.isFinite(value)) return Math.max(0, value)
    }
    return 0
  })

  const effectiveTotalPrice = computed(() => {
    if (hasQuoteForCurrentSelection.value) {
      const value = Number(pricingQuote.value?.total_price)
      if (Number.isFinite(value)) return Math.max(0, value)
    }
    return Math.max(0, effectiveBaseSubtotal.value - effectiveTotalDiscount.value)
  })

  const appliedPromotions = computed(() => {
    if (!hasQuoteForCurrentSelection.value) return []
    return Array.isArray(pricingQuote.value?.applied_promotions)
      ? pricingQuote.value.applied_promotions
      : []
  })

  const syncScreeningContext = () => {
    const singleScreeningId = currentCartScreeningId.value
    if (singleScreeningId) {
      screeningId.value = singleScreeningId
      return
    }

    if (items.value.length === 0) {
      screeningId.value = null
      movieInfo.value = null
      return
    }

    // Estado legado: carrito con múltiples funciones
    screeningId.value = null
  }

  const clearPricingQuote = () => {
    pricingQuote.value = null
  }

  const refreshPricingQuote = async () => {
    if (items.value.length === 0 || hasMultipleScreenings.value || !currentCartScreeningId.value) {
      clearPricingQuote()
      return
    }

    const seatIds = getCurrentSeatIds()
    if (seatIds.length === 0) {
      clearPricingQuote()
      return
    }

    const targetScreeningId = Number(currentCartScreeningId.value)
    const snapshotSeatIds = [...seatIds]
    const snapshotProducts = getCurrentProducts()

    try {
      const quote = await paymentService.previewPricing({
        screening_id: targetScreeningId,
        seat_ids: seatIds,
        products: snapshotProducts,
      })

      if (!quote?.success) return

      const screeningStillSame = Number(currentCartScreeningId.value) === targetScreeningId
      const seatsStillSame = (() => {
        const current = getCurrentSeatIds()
        if (current.length !== snapshotSeatIds.length) return false
        return current.every((id, index) => id === snapshotSeatIds[index])
      })()
      const productsStillSame = (() => {
        const current = getCurrentProducts()
        if (current.length !== snapshotProducts.length) return false
        return current.every((product, index) => {
          const snapshot = snapshotProducts[index]
          return product.code === snapshot.code && product.quantity === snapshot.quantity
        })
      })()

      if (!screeningStillSame || !seatsStillSame || !productsStillSame) return

      pricingQuote.value = {
        screening_id: quote.screening_id,
        seat_ids: quote.seat_ids || snapshotSeatIds,
        products: normalizeProducts(quote.products || snapshotProducts),
        seat_count: quote.seat_count,
        base_subtotal: quote.base_subtotal,
        total_discount: quote.total_discount,
        total_price: quote.total_price,
        applied_promotions: quote.applied_promotions || [],
        order_items: quote.order_items || [],
        updated_at: new Date().toISOString(),
      }
    } catch (error) {
      console.warn('Could not refresh pricing quote:', error)
      clearPricingQuote()
    }
  }

  const schedulePricingQuoteRefresh = () => {
    if (pricingRefreshTimeout) {
      clearTimeout(pricingRefreshTimeout)
    }

    pricingRefreshTimeout = setTimeout(() => {
      refreshPricingQuote()
    }, 180)
  }

  const addItem = (seat) => {
    const newItemScreeningId = normalizeScreeningId(seat?.screening_id)
    const existingScreeningId = currentCartScreeningId.value

    if (!newItemScreeningId) {
      return {
        success: false,
        code: 'MISSING_SCREENING',
        message: 'No se pudo agregar el asiento porque falta la función.'
      }
    }

    if (existingScreeningId && existingScreeningId !== newItemScreeningId) {
      return {
        success: false,
        code: 'SCREENING_MISMATCH',
        message: getScreeningConflictMessage()
      }
    }

    const alreadyExists = items.value.find(item => {
      return Number(item.id) === Number(seat.id) && Number(item.screening_id) === newItemScreeningId
    })

    if (alreadyExists) {
      return {
        success: true,
        code: 'ALREADY_EXISTS'
      }
    }

    items.value.push({
      ...seat,
      screening_id: newItemScreeningId
    })
    syncScreeningContext()
    schedulePricingQuoteRefresh()
    return { success: true }
  }

  const removeItem = (seatId) => {
    items.value = items.value.filter(item => Number(item.id) !== Number(seatId))
    if (items.value.length === 0) {
      selectedProducts.value = []
    }
    syncScreeningContext()
    schedulePricingQuoteRefresh()
  }

  const setSelectedProducts = (products = []) => {
    if (items.value.length === 0) {
      selectedProducts.value = []
      schedulePricingQuoteRefresh()
      return
    }
    selectedProducts.value = normalizeProducts(products)
    schedulePricingQuoteRefresh()
  }

  const updateSelectedProduct = (code, quantity) => {
    if (items.value.length === 0) {
      selectedProducts.value = []
      schedulePricingQuoteRefresh()
      return
    }

    const normalizedCode = String(code || '').trim().toUpperCase()
    if (!normalizedCode) return

    const numericQuantity = Number(quantity)
    const current = normalizeProducts(selectedProducts.value)
    const next = current.filter(product => product.code !== normalizedCode)

    if (Number.isFinite(numericQuantity) && numericQuantity > 0) {
      next.push({
        code: normalizedCode,
        quantity: Math.floor(numericQuantity)
      })
    }

    selectedProducts.value = normalizeProducts(next)
    schedulePricingQuoteRefresh()
  }

  const clearSelectedProducts = () => {
    selectedProducts.value = []
    schedulePricingQuoteRefresh()
  }

  const clearCart = () => {
    items.value = []
    selectedProducts.value = []
    screeningId.value = null
    movieInfo.value = null
    clearPricingQuote()
  }

  const setScreeningInfo = (id, movie) => {
    screeningId.value = id
    movieInfo.value = movie
  }

  const hasItems = computed(() => items.value.length > 0)

  // Payment Session Getters
  const isSessionActive = computed(() => {
    if (!paymentSession.value) return false
    const { reserved_until } = paymentSession.value
    if (!reserved_until) return false
    return new Date(reserved_until).getTime() > nowTimestamp.value
  })

  const secondsRemaining = computed(() => {
    if (!paymentSession.value || !paymentSession.value.reserved_until) return 0
    const remaining = new Date(paymentSession.value.reserved_until).getTime() - nowTimestamp.value
    return Math.max(0, Math.ceil(remaining / 1000))
  })

  const currentSession = computed(() => paymentSession.value)

  // Payment Session Actions
  const setPaymentSession = (sessionData) => {
    paymentSession.value = sessionData
    saveToStorage()
  }

  const clearPaymentSession = () => {
    paymentSession.value = null
    saveToStorage()
  }

  const resetAll = () => {
    items.value = []
    selectedProducts.value = []
    screeningId.value = null
    movieInfo.value = null
    paymentSession.value = null
    pricingQuote.value = null
    saveToStorage()
  }

  // Watch para guardar en storage cuando cambien los datos
  watch(
    [items, selectedProducts, screeningId, movieInfo, paymentSession, pricingQuote],
    () => {
      saveToStorage()
    },
    { deep: true }
  )

  // Cargar datos al inicializar el store
  loadFromStorage()
  syncScreeningContext()
  schedulePricingQuoteRefresh()

  const startClock = () => {
    if (clockInterval) return
    clockInterval = setInterval(() => {
      nowTimestamp.value = Date.now()
    }, 1000)
  }
  startClock()

  return {
    items,
    selectedProducts,
    screeningId,
    movieInfo,
    paymentSession,
    pricingQuote,
    totalPrice,
    effectiveBaseSubtotal,
    effectiveTotalDiscount,
    effectiveTotalPrice,
    appliedPromotions,
    totalSeats,
    cartScreeningIds,
    hasMultipleScreenings,
    currentCartScreeningId,
    getScreeningConflictMessage,
    addItem,
    removeItem,
    setSelectedProducts,
    updateSelectedProduct,
    clearSelectedProducts,
    clearCart,
    clearPricingQuote,
    refreshPricingQuote,
    setScreeningInfo,
    hasItems,
    isSessionActive,
    secondsRemaining,
    currentSession,
    setPaymentSession,
    clearPaymentSession,
    resetAll
  }
})
