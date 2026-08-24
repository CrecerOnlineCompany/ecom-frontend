import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/modules/auth/services/authApi'

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem(AUTH_TOKEN_KEY) || '')
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  const load = () => {
    try {
      const rawUser = localStorage.getItem(AUTH_USER_KEY)
      user.value = rawUser ? JSON.parse(rawUser) : null
    } catch {
      user.value = null
    }
  }

  const persist = () => {
    if (token.value) localStorage.setItem(AUTH_TOKEN_KEY, token.value)
    else localStorage.removeItem(AUTH_TOKEN_KEY)

    if (user.value) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user.value))
    else localStorage.removeItem(AUTH_USER_KEY)
  }

  const setSession = (nextUser, nextToken) => {
    user.value = nextUser || null
    token.value = String(nextToken || '')
    persist()
  }

  const fetchMe = async () => {
    if (!token.value) return null
    loading.value = true
    try {
      const response = await authApi.me()
      user.value = response.user
      persist()
      return user.value
    } catch {
      setSession(null, '')
      return null
    } finally {
      loading.value = false
    }
  }

  const register = async (payload) => {
    loading.value = true
    try {
      const response = await authApi.register(payload)
      setSession(response.user, response.token)
      return response
    } finally {
      loading.value = false
    }
  }

  const login = async (payload) => {
    loading.value = true
    try {
      const response = await authApi.login(payload)
      setSession(response.user, response.token)
      return response
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await authApi.logout()
    } finally {
      setSession(null, '')
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    load,
    fetchMe,
    register,
    login,
    logout,
  }
})

