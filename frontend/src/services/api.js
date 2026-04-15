import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // Auth
  login(apiKey, apiSecret) {
    return apiClient.post('/api/auth/login', { apiKey, apiSecret })
  },

  // Stocks
  getQuote(code) {
    return apiClient.get(`/api/stocks/${code}`)
  },

  getTrackedStocks() {
    return apiClient.get('/api/stocks')
  },

  addStock(code, name) {
    return apiClient.post('/api/stocks', { code, name })
  },

  removeStock(code) {
    return apiClient.delete(`/api/stocks/${code}`)
  },

  getKbars(code, days = 30) {
    return apiClient.get(`/api/stocks/${code}/kbars`, { params: { days } })
  },

  // Orders
  getOrders() {
    return apiClient.get('/api/orders')
  },

  getOrder(id) {
    return apiClient.get(`/api/orders/${id}`)
  },

  placeMarketOrder(code, name, side, quantity) {
    return apiClient.post('/api/orders/market', {
      stockCode: code,
      stockName: name,
      side,
      quantity
    })
  },

  placeLimitOrder(code, name, side, quantity, price) {
    return apiClient.post('/api/orders/limit', {
      stockCode: code,
      stockName: name,
      side,
      quantity,
      price
    })
  },

  cancelOrder(id) {
    return apiClient.post(`/api/orders/${id}/cancel`)
  },

  getTodayStatistics() {
    return apiClient.get('/api/orders/today')
  },

  // User
  getProfile() {
    return apiClient.get('/api/users/me')
  },

  updateProfile(username, email) {
    return apiClient.put('/api/users/me', { username, email })
  },
}

// SSE Stream connection
export function createStockStream(code, onMessage, onError) {
  const token = localStorage.getItem('token')
  const url = `${API_BASE_URL}/api/stocks/${code}/stream${token ? `?token=${token}` : ''}`

  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (e) {
      console.error('SSE parse error:', e)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    onError?.(error)
  }

  return () => {
    eventSource.close()
  }
}
