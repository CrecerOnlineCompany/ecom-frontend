import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'cinea_cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const screeningId = ref(null)
  const movieInfo = ref(null)

  // Cargar datos persistidos del localStorage
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        items.value = data.items || []
        screeningId.value = data.screeningId || null
        movieInfo.value = data.movieInfo || null
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
        movieInfo: movieInfo.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving cart to storage:', error)
    }
  }

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price, 0)
  })

  const totalSeats = computed(() => items.value.length)

  const addItem = (seat) => {
    if (!items.value.find(item => item.id === seat.id)) {
      items.value.push(seat)
    }
  }

  const removeItem = (seatId) => {
    items.value = items.value.filter(item => item.id !== seatId)
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

  // Watch para guardar en storage cuando cambien los datos
  watch(
    [items, screeningId, movieInfo],
    () => {
      saveToStorage()
    },
    { deep: true }
  )

  // Cargar datos al inicializar el store
  loadFromStorage()

  return {
    items,
    screeningId,
    movieInfo,
    totalPrice,
    totalSeats,
    addItem,
    removeItem,
    clearCart,
    setScreeningInfo,
    hasItems
  }
})
