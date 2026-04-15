<template>
  <div class="min-h-screen bg-deep-sea p-4">
    <!-- Header -->
    <header class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-white">📈 Shioaji Trader</h1>
        <p class="text-gray-400 text-sm">即時台股追蹤系統</p>
      </div>
      <div class="flex gap-2">
        <button @click="currentView = 'dashboard'" :class="tabClass('dashboard')">看板</button>
        <button @click="currentView = 'orders'" :class="tabClass('orders')">下單</button>
        <button @click="currentView = 'profile'" :class="tabClass('profile')">會員</button>
      </div>
    </header>

    <!-- Dashboard View -->
    <div v-if="currentView === 'dashboard'">
      <!-- Search Section -->
      <div class="glass-card p-4 mb-6">
        <div class="flex gap-2">
          <input
            v-model="searchCode"
            type="text"
            class="input-field flex-1"
            placeholder="輸入股票代碼 (如: 2330)"
            @keyup.enter="searchStock"
          />
          <button @click="searchStock" class="btn-primary">查詢</button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="glass-card p-4 mb-6 border-red-500">
        <p class="text-red-500">{{ error }}</p>
      </div>

      <!-- Stock Detail -->
      <div v-if="currentStock" class="glass-card p-4 mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-white">{{ currentStock.code }}</h2>
            <p class="text-gray-400">{{ currentStock.name }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold" :class="priceColor">
              {{ currentStock.currentPrice?.toFixed(2) || '-' }}
            </p>
            <p class="text-sm" :class="priceColor">
              {{ changeText }}
            </p>
          </div>
        </div>

        <!-- Chart -->
        <StockChart :symbol="currentStock.code" :data="chartData" />

        <!-- Quick Order Buttons -->
        <div class="flex gap-2 mt-4">
          <button @click="showOrderModal('buy')" class="btn-success flex-1">買入</button>
          <button @click="showOrderModal('sell')" class="btn-danger flex-1">賣出</button>
          <button v-if="!isTracked" @click="addToTracking" class="btn-primary flex-1">+ 追蹤</button>
          <button v-else @click="removeFromTracking" class="btn-primary flex-1">- 移除</button>
        </div>
      </div>

      <!-- Tracked Stocks -->
      <div class="glass-card p-4">
        <h3 class="text-lg font-bold text-white mb-4">追蹤清單</h3>
        
        <div v-if="loading" class="space-y-3">
          <div class="skeleton h-24 rounded-lg"></div>
        </div>

        <div v-else-if="trackedStocks.length === 0" class="text-gray-500 text-center py-8">
          <p>尚無追蹤股票</p>
        </div>

        <div v-else class="space-y-3">
          <StockCard
            v-for="stock in trackedStocks"
            :key="stock.code"
            :stock="stock"
            @click="selectStock(stock)"
          />
        </div>
      </div>
    </div>

    <!-- Orders View -->
    <div v-if="currentView === 'orders'" class="glass-card p-4">
      <h3 class="text-lg font-bold text-white mb-4">當日委託</h3>
      
      <div v-if="ordersLoading" class="skeleton h-32 rounded-lg"></div>
      
      <div v-else-if="orders.length === 0" class="text-gray-500 text-center py-8">
        <p>尚無委託記錄</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-gray-800/50 rounded-lg p-3"
        >
          <div class="flex justify-between items-center">
            <div>
              <span class="font-bold" :class="order.side === 'Buy' ? 'text-green-500' : 'text-red-500'">
                {{ order.side === 'Buy' ? '買' : '賣' }}
              </span>
              <span class="text-white ml-2">{{ order.stockCode }}</span>
              <span class="text-gray-400 ml-2">{{ order.quantity }} 股</span>
            </div>
            <div class="text-right">
              <span class="text-sm" :class="statusClass(order.status)">{{ statusText(order.status) }}</span>
              <p v-if="order.price > 0" class="text-gray-400 text-sm">{{ order.price }}</p>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ formatDateTime(order.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Profile View -->
    <div v-if="currentView === 'profile'" class="glass-card p-4">
      <h3 class="text-lg font-bold text-white mb-4">會員資料</h3>
      <div class="text-gray-400">
        <p>API Key: {{ maskedApiKey }}</p>
        <p>上次登入: {{ lastLogin }}</p>
      </div>
      <button @click="logout" class="btn-danger w-full mt-4">登出</button>
    </div>

    <!-- Order Modal -->
    <div v-if="orderModal.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="glass-card p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">
          {{ orderModal.action === 'buy' ? '買入' : '賣出' }} {{ orderModal.stockCode }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">數量（股）</label>
            <input v-model="orderModal.quantity" type="number" class="input-field w-full" min="1" />
          </div>
          
          <div v-if="orderModal.action === 'limit'">
            <label class="block text-sm text-gray-400 mb-2">價格</label>
            <input v-model="orderModal.price" type="number" class="input-field w-full" min="0.1" step="0.1" />
          </div>

          <div class="flex gap-2">
            <button @click="placeOrder" class="btn-primary flex-1">確認</button>
            <button @click="orderModal.show = false" class="btn-primary bg-gray-600 flex-1">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api, { createStockStream } from '../services/api'
import StockCard from '../components/StockCard.vue'
import StockChart from '../components/StockChart.vue'

const router = useRouter()

// State
const searchCode = ref('')
const currentStock = ref(null)
const trackedStocks = ref([])
const chartData = ref([])
const loading = ref(false)
const error = ref('')
const currentView = ref('dashboard')
const orders = ref([])
const ordersLoading = ref(false)

const orderModal = ref({
  show: false,
  action: 'buy',
  stockCode: '',
  quantity: 1,
  price: 0,
  isLimit: false
})

let eventSource = null

// Computed
const isTracked = computed(() => 
  trackedStocks.value.some(s => s.code === currentStock.value?.code)
)

const priceColor = computed(() => {
  if (!currentStock.value) return 'text-gray-500'
  return (currentStock.value.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'
})

const changeText = computed(() => {
  if (!currentStock.value) return ''
  const c = currentStock.value.change || 0
  const p = currentStock.value.changePercent || 0
  const sign = c >= 0 ? '+' : ''
  return `${sign}${c.toFixed(2)} (${sign}${p.toFixed(2)}%)`
})

const maskedApiKey = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.apiKey) return '******'
  return user.apiKey.substring(0, 4) + '****'
})

const lastLogin = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.lastLoginAt || '-'
})

// Methods
const searchStock = async () => {
  if (!searchCode.value.trim()) return
  
  loading.value = true
  error.value = ''
  
  try {
    // Fetch stock quote
    const response = await api.getQuote(searchCode.value.trim().toUpperCase())
    if (response.data.success) {
      currentStock.value = response.data.data
      
      // Fetch K-line data for chart
      try {
        const kbarsResponse = await api.getKbars(searchCode.value.trim().toUpperCase())
        if (kbarsResponse.data?.data?.kbars) {
          // Transform kbars data to chart format
          chartData.value = kbarsResponse.data.data.kbars.map(d => ({
            time: d.date,
            open: parseFloat(d.open),
            high: parseFloat(d.high),
            low: parseFloat(d.low),
            close: parseFloat(d.close),
            volume: parseInt(d.volume)
          }))
        }
      } catch (kbErr) {
        console.error('Failed to fetch kbars:', kbErr)
        chartData.value = []
      }
      
      subscribeToStream(searchCode.value.trim().toUpperCase())
    } else {
      error.value = response.data.message || '找不到股票'
    }
  } catch (err) {
    error.value = err.response?.data?.message || '查詢失敗'
  } finally {
    loading.value = false
  }
}

const subscribeToStream = (code) => {
  if (eventSource) {
    eventSource()
    eventSource = null
  }
  
  eventSource = createStockStream(
    code,
    (data) => {
      if (currentStock.value?.code === data.code) {
        currentStock.value = data
      }
      const idx = trackedStocks.value.findIndex(s => s.code === data.code)
      if (idx !== -1) {
        trackedStocks.value[idx] = { ...trackedStocks.value[idx], ...data }
      }
    },
    (err) => {
      console.error('Stream error:', err)
    }
  )
}

const selectStock = (stock) => {
  searchCode.value = stock.code
  searchStock()
}

const addToTracking = async () => {
  if (!currentStock.value) return
  try {
    await api.addStock(currentStock.value.code, currentStock.value.name)
    await loadTrackedStocks()
  } catch (err) {
    error.value = err.response?.data?.message || '加入失敗'
  }
}

const removeFromTracking = async () => {
  if (!currentStock.value) return
  try {
    await api.removeStock(currentStock.value.code)
    await loadTrackedStocks()
  } catch (err) {
    error.value = err.response?.data?.message || '移除失敗'
  }
}

const loadTrackedStocks = async () => {
  try {
    const response = await api.getTrackedStocks()
    if (response.data.success) {
      trackedStocks.value = response.data.data || []
    }
  } catch (err) {
    console.error('Load tracked stocks error:', err)
  }
}

const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const response = await api.getOrders()
    if (response.data.success) {
      orders.value = response.data.data || []
    }
  } catch (err) {
    console.error('Load orders error:', err)
  } finally {
    ordersLoading.value = false
  }
}

const showOrderModal = (action) => {
  orderModal.value = {
    show: true,
    action,
    stockCode: currentStock.value?.code || '',
    quantity: 1,
    price: currentStock.value?.currentPrice || 0,
    isLimit: false
  }
}

const placeOrder = async () => {
  try {
    if (orderModal.value.isLimit) {
      await api.placeLimitOrder(
        orderModal.value.stockCode,
        null,
        orderModal.value.action === 'buy' ? 'Buy' : 'Sell',
        orderModal.value.quantity,
        orderModal.value.price
      )
    } else {
      await api.placeMarketOrder(
        orderModal.value.stockCode,
        null,
        orderModal.value.action === 'buy' ? 'Buy' : 'Sell',
        orderModal.value.quantity
      )
    }
    orderModal.value.show = false
    await loadOrders()
  } catch (err) {
    error.value = err.response?.data?.message || '下單失敗'
  }
}

const tabClass = (tab) => {
  return currentView.value === tab 
    ? 'px-4 py-2 bg-purple-600 text-white rounded-lg'
    : 'px-4 py-2 bg-gray-700 text-gray-300 rounded-lg'
}

const statusClass = (status) => {
  switch (status) {
    case 'Filled': return 'text-green-500'
    case 'Pending': return 'text-yellow-500'
    case 'Cancelled': return 'text-gray-500'
    default: return 'text-gray-400'
  }
}

const statusText = (status) => {
  switch (status) {
    case 'Pending': return '等待中'
    case 'Submitted': return '已送出'
    case 'Filled': return '已成交'
    case 'Cancelled': return '已取消'
    default: return status
  }
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-TW')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// Lifecycle
onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  loadTrackedStocks()
  loadOrders()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource()
  }
})
</script>
