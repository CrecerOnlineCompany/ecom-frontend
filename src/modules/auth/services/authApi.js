import api from '@/services/api'

export const authApi = {
  async register(payload) {
    const response = await api.post('/auth/register', payload)
    return response.data
  },

  async login(payload) {
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  async me() {
    const response = await api.get('/me')
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },
}

