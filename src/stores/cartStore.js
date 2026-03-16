import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'cinea_cart'
const PAYMENT_SESSION_KEY = 'cinea_payment_session'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const screeningId = ref(null)
  const movieInfo = ref(null)
  const paymentSession = ref(null)
  const nowTimestamp = ref(Date.now())
  let clockInterval = null

  // Cargar datos persistidos del localStorage
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        items.value = data.items || []
        screeningId.value = data.screeningId || null
        movieInfo.value = data.movieInfo || null
        paymentSession.value = data.paymentSession || null
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
        screeningId: screeningId.value,
        movieInfo: movieInfo.value,
        paymentSession: paymentSession.value
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
    return { success: true }
  }

  const removeItem = (seatId) => {
    items.value = items.value.filter(item => Number(item.id) !== Number(seatId))
    syncScreeningContext()
  }

  const clearCart = () => {
    items.value = []
    screeningId.value = null
    movieInfo.value = null
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
    screeningId.value = null
    movieInfo.value = null
    paymentSession.value = null
    saveToStorage()
  }

  // Watch para guardar en storage cuando cambien los datos
  watch(
    [items, screeningId, movieInfo, paymentSession],
    () => {
      saveToStorage()
    },
    { deep: true }
  )

  // Cargar datos al inicializar el store
  loadFromStorage()
  syncScreeningContext()

  const startClock = () => {
    if (clockInterval) return
    clockInterval = setInterval(() => {
      nowTimestamp.value = Date.now()
    }, 1000)
  }
  startClock()

  return {
    items,
    screeningId,
    movieInfo,
    paymentSession,
    totalPrice,
    totalSeats,
    cartScreeningIds,
    hasMultipleScreenings,
    currentCartScreeningId,
    getScreeningConflictMessage,
    addItem,
    removeItem,
    clearCart,
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
