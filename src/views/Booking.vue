<template>
  <div class="booking-page">
    <div class="container">
      <router-link to="/movies" class="back-link">
        ← Volver a películas
      </router-link>

      <h1>Seleccionar Asientos</h1>

      <div v-if="loading" class="loading">
        Cargando datos de la función...
      </div>

      <div v-else-if="screening" class="booking-content">
        <!-- Screening Info -->
        <div class="screening-info">
          <h2>{{ movieTitle }}</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Cine:</span>
              <span>{{ screening.cinema_name || screening.cinema?.name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Sala:</span>
              <span>{{ screening.room_number || screening.room?.room_number || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Fecha:</span>
              <span>{{ formatDate(screening.start_time) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Hora:</span>
              <span>{{ formatTime(screening.start_time) }}</span>
            </div>
          </div>
        </div>

        <div class="booking-layout">
          <!-- Seat Selection -->
          <div class="seat-selection">
            <div class="screen">PANTALLA</div>

            <div v-if="seatsLoading" class="loading">
              Cargando asientos...
            </div>

            <div v-else-if="seats.length > 0" class="seats-container">
              <div 
                v-for="(row, rowIndex) in seatsByRow" 
                :key="rowIndex"
                class="seat-row "
              >
                <div class="row-label">{{ getRowLabel(row, rowIndex) }}</div>
                <div class="row-seats">
                  <div
                    v-for="seat in row"
                    :key="seat.id"
                    :class="['seat', getSeatClass(seat)]"
                    @click="toggleSeat(seat)"
                    :title="`Asiento ${getSeatCode(seat)}`"
                  >
                    <span v-if="isBlocked(seat)" class="occupied-icon">⛔</span>
                    <span v-else-if="isSelected(seat) || !isOccupied(seat)" class="seat-number">
                      {{ seat.seat_number }}
                    </span>
                    <span v-else class="occupied-icon">✗</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="legend">
              <div class="legend-item">
                <div class="seat available"></div>
                <span>Disponible</span>
              </div>
              <div class="legend-item">
                <div class="seat selected"></div>
                <span>Seleccionado</span>
              </div>
              <div class="legend-item">
                <div class="seat occupied"></div>
                <span>Ocupado</span>
              </div>
              <div class="legend-item">
                <div class="seat blocked"></div>
                <span>Bloqueado</span>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <h3>Resumen de Compra</h3>

            <div v-if="selectedSeats.length > 0" class="selected-seats">
              <h4>Asientos Seleccionados:</h4>
              <div class="seat-list">
                <div 
                  v-for="seat in selectedSeats" 
                  :key="seat.id"
                  class="seat-item"
                >
                  <span>{{ seat.seat_code || `${String.fromCharCode(64 + seat.row_number)}${seat.seat_number}` }}</span>
                  <span class="seat-price">${{ getSeatPrice(seat) }}</span>
                  <button 
                    @click="toggleSeat(seat)"
                    class="remove-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-cart">
              <p>No hay asientos seleccionados</p>
            </div>

            <!-- Price Summary -->
            <div class="price-summary">
              <div class="price-row">
                <span>Asientos: {{ selectedSeats.length }}</span>
              </div>
              <div class="price-row">
                <span>Subtotal:</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="price-row total">
                <span>Total:</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Buttons -->
            <div class="action-buttons">
              <button 
                @click="proceedToCheckout"
                :disabled="selectedSeats.length === 0"
                class="btn btn-primary"
              >
                Continuar Compra ({{ selectedSeats.length }})
              </button>
              <button 
                @click="clearSelection"
                class="btn btn-secondary"
              >
                Limpiar Selección
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-data">
        No se encontró información de la función
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { screeningService } from '@/services/ticketService'
import { useCartStore } from '@/stores/cartStore'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const screening = ref(null)
const seats = ref([])
const selectedSeats = ref([])
const loading = ref(true)
const seatsLoading = ref(false)
const movieTitle = ref('')
const basePrice = 8

const parseSeatLabel = (seatLabel = '') => {
  const normalized = String(seatLabel).trim().toUpperCase()
  const match = normalized.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null

  const rowLetters = match[1]
  const seatNumber = Number(match[2])
  const rowNumber = rowLetters
    .split('')
    .reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0)

  return {
    row_number: rowNumber || 1,
    seat_number: Number.isNaN(seatNumber) ? 1 : seatNumber
  }
}

onMounted(async () => {
  await loadScreeningData()
  // Restaurar asientos seleccionados desde el carrito
  restoreSelectedSeatsFromCart()
})

/**
 * Restaurar asientos seleccionados desde el carrito
 * Útil cuando vuelves del checkout para modificar asientos
 */
const restoreSelectedSeatsFromCart = () => {
  if (cartStore.items.length === 0) {
    return
  }

  // Obtener los seat_id del carrito para esta screening
  const screeningId = Number(route.params.id)
  const cartSeatsInThisScreening = cartStore.items.filter(
    item => Number(item.screening_id) === screeningId
  )

  if (cartSeatsInThisScreening.length === 0) {
    return
  }

  // Restaurar los asientos seleccionados aunque la API no los devuelva
  selectedSeats.value = cartSeatsInThisScreening
    .map(cartItem => {
      const cartSeatId = Number(cartItem.seat_id ?? cartItem.id)
      const seatFromApi = seats.value.find(seat => Number(seat.id) === cartSeatId)
      if (seatFromApi) return seatFromApi

      const parsedSeat = parseSeatLabel(cartItem.seat_label)
      return {
        id: cartSeatId,
        row_number: parsedSeat?.row_number || 1,
        seat_number: parsedSeat?.seat_number || 1,
        seat_code: cartItem.seat_label || undefined,
        status: 'reserved'
      }
    })
    .filter((seat, index, allSeats) => {
      return allSeats.findIndex(item => Number(item.id) === Number(seat.id)) === index
    })

  selectedSeats.value = selectedSeats.value.filter(seat => {
    return cartSeatsInThisScreening.some(cartItem => Number(cartItem.seat_id ?? cartItem.id) === Number(seat.id))
  })

  console.log(`Restored ${selectedSeats.value.length} selected seats from cart`)
}

const loadScreeningData = async () => {
  try {
    const screeningId = route.params.id
    
    // Load screening details
    const screeningData = await screeningService.getById(screeningId)
    
    if (screeningData) {
      screening.value = screeningData
      movieTitle.value = screeningData.movie_title || screeningData.movie?.title || 'Película'
      
      // Load available seats
      await loadSeats()
    }
  } catch (error) {
    console.error('Error loading screening data:', error)
    screening.value = null
  } finally {
    loading.value = false
  }
}

const loadSeats = async () => {
  seatsLoading.value = true
  try {
    const screeningId = route.params.id
    const response = await screeningService.getAvailableSeats(screeningId)
    console.log('Seats response from API:', response)
    
    // La API devuelve { screening_id, available_seats_count, seats: [...] }
    if (response && response.seats) {
      seats.value = response.seats
      console.log('Loaded seats:', seats.value.length)
    } else if (Array.isArray(response)) {
      seats.value = response
      console.log('Loaded seats (array):', seats.value.length)
    } else {
      console.log('No seats found in response')
      seats.value = []
    }

    // Restaurar asientos seleccionados desde el carrito después de cargar
    restoreSelectedSeatsFromCart()
  } catch (error) {
    console.error('Error loading seats:', error)
    seats.value = []
  } finally {
    seatsLoading.value = false
  }
}

const seatsByRow = computed(() => {
  const rows = {}
  const mergedSeats = [...seats.value]
  const existingCoordinates = new Set(
    seats.value.map(seat => `${Number(seat.row_number || seat.row || 1)}-${Number(seat.seat_number || 0)}`)
  )

  // El endpoint trae solo asientos disponibles; agregar seleccionados para poder renderizarlos.
  selectedSeats.value.forEach(seat => {
    const rowNum = Number(seat.row_number || seat.row || 1)
    const seatNum = Number(seat.seat_number || 0)
    const coordinate = `${rowNum}-${seatNum}`
    if (!existingCoordinates.has(coordinate)) {
      mergedSeats.push({
        ...seat,
        row_number: rowNum,
        seat_number: seatNum
      })
      existingCoordinates.add(coordinate)
    }
  })

  mergedSeats.forEach(seat => {
    const rowNum = seat.row_number || seat.row || 1
    if (!rows[rowNum]) {
      rows[rowNum] = []
    }
    rows[rowNum].push(seat)
  })

  // Completar estructura: si faltan números de asiento en una fila, se renderizan como bloqueados.
  return Object.keys(rows)
    .sort((a, b) => Number(a) - Number(b))
    .map(rowNum => {
      const rowSeats = rows[rowNum].sort((a, b) => (a.seat_number || 0) - (b.seat_number || 0))
      const maxSeatNumber = Math.max(...rowSeats.map(seat => Number(seat.seat_number || 0)), 6)
      const seatsByNumber = new Map(rowSeats.map(seat => [Number(seat.seat_number), seat]))
      const filledRow = []

      for (let seatNumber = 1; seatNumber <= maxSeatNumber; seatNumber += 1) {
        const currentSeat = seatsByNumber.get(seatNumber)
        if (currentSeat) {
          filledRow.push(currentSeat)
          continue
        }

        filledRow.push({
          id: `blocked-${rowNum}-${seatNumber}`,
          row_number: Number(rowNum),
          seat_number: seatNumber,
          status: 'blocked',
          is_available: false,
          is_placeholder: true
        })
      }

      return filledRow
    })
})

const isOccupied = (seat) => {
  const status = String(seat.status || '').toLowerCase()
  return status === 'occupied' || status === 'reserved' || status === 'sold' || status === 'unavailable'
}

const isBlocked = (seat) => {
  const status = String(seat.status || '').toLowerCase()
  return status === 'blocked' || seat.is_available === false || seat.is_placeholder === true
}

const isSelected = (seat) => {
  return selectedSeats.value.some(s => Number(s.id) === Number(seat.id))
}

const getSeatClass = (seat) => {
  if (isSelected(seat)) return 'selected'
  if (isBlocked(seat)) return 'blocked'
  if (isOccupied(seat)) return 'occupied'
  return 'available'
}

const getSeatCode = (seat) => {
  if (seat.seat_code) return seat.seat_code
  const rowNumber = Number(seat.row_number || seat.row || 1)
  return `${String.fromCharCode(64 + rowNumber)}${seat.seat_number || ''}`
}

const getRowLabel = (row, rowIndex) => {
  const seatWithCode = row.find(seat => seat.seat_code)
  if (seatWithCode?.seat_code) return seatWithCode.seat_code.charAt(0)
  const rowNumber = Number(row[0]?.row_number || rowIndex + 1)
  return String.fromCharCode(64 + rowNumber)
}

const getSeatPrice = (seat) => {
  return basePrice
}

const toggleSeat = (seat) => {
  console.log('Toggle seat clicked:', seat)
  console.log('Is occupied:', isOccupied(seat))

  const index = selectedSeats.value.findIndex(s => Number(s.id) === Number(seat.id))
  if (index > -1) {
    console.log('Removing seat from selection')
    selectedSeats.value.splice(index, 1)
    // También remover del carrito si existe
    cartStore.removeItem(seat.id)
  } else {
    if (isOccupied(seat) || isBlocked(seat)) {
      console.log('Seat is unavailable, cannot select')
      return
    }
    console.log('Adding seat to selection')
    selectedSeats.value.push(seat)
  }
  console.log('Selected seats:', selectedSeats.value)
}

const subtotal = computed(() => {
  return selectedSeats.value.length * basePrice
})

const clearSelection = () => {
  selectedSeats.value = []
}

const proceedToCheckout = () => {
  // Guardar info de screening en cartStore para poder volver
  cartStore.setScreeningInfo(screening.value.id, {
    title: movieTitle.value,
    screening_id: screening.value.id
  })

  // Add seats to cart
  selectedSeats.value.forEach(seat => {
    cartStore.addItem({
      id: seat.id,
      screening_id: screening.value.id,
      seat_id: seat.id,
      seat_label: seat.seat_code || `${String.fromCharCode(64 + seat.row_number)}${seat.seat_number}`,
      price: getSeatPrice(seat),
      movie_title: movieTitle.value
    })
  })

  // Navigate to checkout
  router.push('/checkout')
}

const formatDate = (dateTimeString) => {
  try {
    const date = parseISO(dateTimeString)
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateTimeString
  }
}

const formatTime = (dateTimeString) => {
  try {
    const date = parseISO(dateTimeString)
    return format(date, 'HH:mm')
  } catch {
    return dateTimeString.split(' ')[1]
  }
}
</script>

<style scoped>
.booking-page {
  padding: 2rem 0;
  min-height: 800px;
}

.back-link {
  display: inline-block;
  margin-bottom: 2rem;
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #fff;
}

.booking-page h1 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
}

.booking-content {
  max-width: 1400px;
  margin: 0 auto;
}

.screening-info {
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  margin-bottom: 2rem;
}

.screening-info h2 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: var(--primary);
  font-weight: 600;
  margin-right: 0.5rem;
}

.booking-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.seat-selection {
  background: #2d2d2d54;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
}

.screen {
  text-align: center;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 2rem;
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 4px;
}

.seats-container {
  margin-bottom: 2rem;
}

.seat-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
  justify-content: center;
}

.row-label {
  width: 30px;
  text-align: center;
  font-weight: 600;
  color: var(--primary);
}

.row-seats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.seat {
  width: 40px;
  height: 40px;
  border: 2px solid #3d3d3d;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  user-select: none;
}

.seat span {
  pointer-events: none;
}

.seat.available {
  background: #2d2d2d;
  color: #ccc;
  border-color: #3d3d3d;
}

.seat.available:hover {
  border-color: var(--primary);
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.3);
}

.seat.selected {
  background: var(--primary);
  border-color: var(--primary);
  color: #000;
}

.seat.occupied {
  background: #666;
  border-color: #555;
  color: #999;
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

.seat.blocked {
  background: #3d3d3d;
  border-color: #4a4a4a;
  color: #888;
  cursor: not-allowed;
  opacity: 0.75;
  pointer-events: none;
}

.occupied-icon {
  font-size: 1.2rem;
}

.legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border-radius: 4px;
  margin-top: 2rem;
}

.legend-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.legend-item .seat {
  width: 25px;
  height: 25px;
  cursor: default;
  margin: 0;
}

.legend-item span {
  color: #ccc;
  font-size: 0.9rem;
}

.cart-summary {
  background: #2d2d2d54;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #3d3d3d;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-summary h3 {
  color: var(--primary);
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #3d3d3d;
  padding-bottom: 1rem;
}

.cart-summary h4 {
  color: #ccc;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.selected-seats {
  margin-bottom: 1.5rem;
}

.seat-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.seat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a1a1a;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #3d3d3d;
  font-size: 0.9rem;
}

.seat-item span:first-child {
  font-weight: 600;
  color: var(--primary);
}

.seat-price {
  color: #ccc;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: var(--primary);
}

.empty-cart {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
}

.price-summary {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border: 1px solid #3d3d3d;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #ccc;
  font-size: 0.95rem;
}

.price-row.total {
  border-top: 2px solid var(--primary);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

@media (max-width: 1024px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .booking-page {
    padding: 1.5rem 0;
  }

  .back-link {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .booking-page h1 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .screening-info {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .screening-info h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .info-item {
    gap: 0.25rem;
  }

  .info-item .label {
    font-size: 0.85rem;
  }

  .info-item span:last-child {
    font-size: 0.95rem;
  }

  .booking-layout {
    flex-direction: column;
    gap: 1.5rem;
  }

  .seat-selection {
    width: 100%;
  }

  .screen {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
  }

  .seat {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
    margin: 0.3rem;
  }

  .row-label {
    min-width: 25px;
    font-size: 0.8rem;
  }

  .row-seats {
    gap: 0.25rem;
  }

  .legend {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 1rem;
  }

  .legend-item {
    gap: 0.5rem;
  }

  .legend-item span {
    font-size: 0.8rem;
  }

  .legend-item .seat {
    width: 24px;
    height: 24px;
  }

  .cart-summary {
    width: 100%;
    position: static;
    padding: 1.25rem;
  }

  .cart-summary h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .selected-seats {
    margin-bottom: 1.5rem;
  }

  .selected-seats h4 {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }

  .seat-list {
    gap: 0.5rem;
  }

  .seat-item {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .price-summary {
    gap: 0.75rem;
    margin: 1.5rem 0;
    font-size: 0.95rem;
  }

  .price-item {
    gap: 0.5rem;
  }

  .total-price {
    font-size: 1.3rem;
    padding: 0.75rem;
  }

  .checkout-btn {
    width: 100%;
    padding: 0.8rem;
    font-size: 0.95rem;
  }

  .no-selection {
    padding: 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .booking-page {
    padding: 1rem 0;
  }

  .back-link {
    margin-bottom: 0.75rem;
    font-size: 0.8rem;
  }

  .booking-page h1 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .screening-info {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .screening-info h2 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .info-item {
    flex-direction: row;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .info-item .label {
    font-size: 0.75rem;
    min-width: 50px;
  }

  .info-item span:last-child {
    font-size: 0.85rem;
    text-align: right;
  }

  .seat-selection {
    overflow-x: auto;
  }

  .screen {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
    padding: 0.6rem;
  }

  .seat {
    width: 28px;
    height: 28px;
    font-size: 0.6rem;
    margin: 0.2rem;
  }

  .row-label {
    min-width: 22px;
    font-size: 0.7rem;
  }

  .legend {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .legend-item {
    flex-direction: row;
    gap: 0.4rem;
    font-size: 0.75rem;
  }

  .legend-item .seat {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .cart-summary {
    padding: 1rem;
  }

  .cart-summary h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .selected-seats h4 {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .seat-list {
    gap: 0.35rem;
  }

  .seat-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .seat-item-remove {
    width: 20px;
    height: 20px;
    font-size: 0.6rem;
  }

  .price-summary {
    gap: 0.5rem;
    margin: 1rem 0;
    font-size: 0.85rem;
  }

  .price-item {
    gap: 0.4rem;
  }

  .price-value {
    font-size: 0.85rem;
  }

  .total-price {
    font-size: 1.2rem;
    padding: 0.6rem;
  }

  .checkout-btn {
    width: 100%;
    padding: 0.7rem;
    font-size: 0.85rem;
  }

  .no-selection {
    padding: 1rem;
    font-size: 0.85rem;
  }
}
</style>
