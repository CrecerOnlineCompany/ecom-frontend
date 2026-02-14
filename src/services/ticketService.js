import api from './api'

// Helper para extraer datos de respuesta paginada o directa
const extractData = (response) => {
  if (response.data && Array.isArray(response.data)) {
    return response.data
  }
  if (Array.isArray(response)) {
    return response
  }
  return response
}

// Cines
export const cinemaService = {
  getAll: async () => {
    try {
      const response = await api.get('/cinemas')
      const data = extractData(response.data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching cinemas:', error)
      return []
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/cinemas/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching cinema:', error)
      return null
    }
  }
}

// Películas
export const movieService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/movies', { params })
      const data = extractData(response.data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching movies:', error)
      return []
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/movies/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching movie:', error)
      return null
    }
  }
}

// Salas
export const roomService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/rooms', { params })
      const data = extractData(response.data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/rooms/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching room:', error)
      return null
    }
  }
}

// Funciones
export const screeningService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/screenings', { params })
      const data = extractData(response.data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching screenings:', error)
      return []
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/screenings/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching screening:', error)
      return null
    }
  },
  getByMovie: async (movieId) => {
    try {
      const response = await api.get('/screenings', { params: { movie_id: movieId } })
      const data = extractData(response.data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching screenings by movie:', error)
      return []
    }
  },
  getAvailableSeats: async (id) => {
    try {
      const response = await api.get(`/screenings/${id}/available-seats`)
      // La API devuelve { screening_id, available_seats_count, seats: [...] }
      // No usar extractData aquí, devolver la respuesta completa
      return response.data
    } catch (error) {
      console.error('Error fetching available seats:', error)
      return { seats: [] }
    }
  },
  getMyTickets: async (id) => {
    try {
      const response = await api.get(`/screenings/${id}/my-tickets`)
      const data = extractData(response.data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching my tickets:', error)
      return []
    }
  }
}

// Entradas
export const ticketService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/tickets', { params })
      const data = extractData(response.data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching tickets:', error)
      return []
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/tickets/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching ticket:', error)
      return null
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/tickets', data)
      return response.data
    } catch (error) {
      console.error('Error creating ticket:', error)
      throw error
    }
  },
  cancel: async (id) => {
    try {
      const response = await api.delete(`/tickets/${id}`)
      return response.data
    } catch (error) {
      console.error('Error canceling ticket:', error)
      throw error
    }
  }
}
