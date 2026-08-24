import api from '@/services/api'

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG

const withStoreHeaders = (extra = {}) => ({
  ...(STORE_SLUG ? { 'X-Store-Slug': STORE_SLUG } : {}),
  ...extra,
})

export const ecomApi = {
  async getCatalog(params = {}) {
    const response = await api.get('/ecom/catalog', {
      params,
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async getProduct(slug) {
    const response = await api.get(`/ecom/products/${encodeURIComponent(slug)}`, {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async getPaymentMethods() {
    const response = await api.get('/ecom/payment-methods', {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async getShippingProviders() {
    const response = await api.get('/ecom/shipping/providers', {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async quoteShipping(payload) {
    const response = await api.post('/ecom/shipping/quote', payload, {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async quote(payload) {
    const response = await api.post('/ecom/checkout/quote', payload, {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async checkout(payload) {
    const response = await api.post('/ecom/checkout', payload, {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async getOrder(orderNumber) {
    const response = await api.get(`/ecom/orders/${encodeURIComponent(orderNumber)}`, {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async getMyOrders() {
    const response = await api.get('/ecom/my/orders', {
      headers: withStoreHeaders(),
    })
    return response.data
  },

  async getOrderDownloads(orderNumber) {
    const response = await api.get(`/ecom/my/orders/${encodeURIComponent(orderNumber)}/downloads`, {
      headers: withStoreHeaders(),
    })
    return response.data
  },
}
