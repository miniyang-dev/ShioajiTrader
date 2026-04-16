import axios from 'axios'

// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
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

// Named exports
export const login = (apiKey, apiSecret) => 
  apiClient.post('/api/auth/login', { apiKey, apiSecret })

export const getQuote = (code) => 
  apiClient.get(`/api/stocks/${code}`)

export const getTrackedStocks = () => 
  apiClient.get('/api/stocks')

export const addStock = (code, name) => 
  apiClient.post('/api/stocks', { code, name })

export const removeStock = (code) => 
  apiClient.delete(`/api/stocks/${code}`)

export const getKbars = (code, days = 30) => 
  apiClient.get(`/api/stocks/${code}/kbars`, { params: { days } })

export const getOrders = () => 
  apiClient.get('/api/orders')

export const getOrder = (id) => 
  apiClient.get(`/api/orders/${id}`)

export const placeMarketOrder = (code, name, side, quantity) => 
  apiClient.post('/api/orders/market', { stockCode: code, stockName: name, side, quantity })

export const placeLimitOrder = (code, name, side, quantity, price) => 
  apiClient.post('/api/orders/limit', { stockCode: code, stockName: name, side, quantity, price })

export const cancelOrder = (id) => 
  apiClient.post(`/api/orders/${id}/cancel`)

export const getTodayStatistics = () => 
  apiClient.get('/api/orders/today')

export const getProfile = () => 
  apiClient.get('/api/users/me')

export const updateProfile = (username, email) => 
  apiClient.put('/api/users/me', { username, email })

// Default export for backward compatibility
export default apiClient