<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <span class="text-2xl">📈</span>
            Shioaji Trader
          </h1>
          <div class="flex items-center gap-4">
            <span class="text-slate-400 text-sm">{{ currentTime }}</span>
            <button 
              @click="handleLogout"
              class="text-slate-400 hover:text-white transition-colors text-sm"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <!-- Stock Search -->
      <div class="mb-8">
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/30">
          <div class="flex gap-4">
            <div class="flex-1">
              <input
                v-model="searchCode"
                type="text"
                placeholder="輸入股票代碼 (例如: 2330)"
                class="w-full bg-slate-900/50 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                @keyup.enter="searchStock"
              />
            </div>
            <button
              @click="searchStock"
              :disabled="loading"
              class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {{ loading ? '查詢中...' : '查詢' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
        {{ error }}
      </div>

      <!-- Current Stock Info -->
      <div v-if="currentStock" class="mb-8">
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/30">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-3xl font-bold text-white">{{ currentStock.code }}</h2>
              <p class="text-slate-400 mt-1">{{ currentStock.name }}</p>
            </div>
            <div class="text-right">
              <div class="text-4xl font-bold" :class="currentStock.change >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ currentStock.currentPrice }}
              </div>
              <div class="text-lg mt-1" :class="currentStock.change >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ currentStock.change >= 0 ? '+' : '' }}{{ currentStock.change }} ({{ currentStock.changePercent }}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div v-if="currentStock" class="mb-8">
        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/30">
          <h3 class="text-lg font-semibold text-white mb-4">K線圖</h3>
          <StockChart v-if="chartData.length > 0" :data="chartData" />
          <div v-else class="h-96 flex items-center justify-center text-slate-500">
            <span v-if="loading">載入中...</span>
            <span v-else>暫無K線資料</span>
          </div>
        </div>
      </div>

      <!-- Tracked Stocks -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">追蹤清單</h3>
          <button
            @click="showAddDialog = true"
            class="bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + 新增股票
          </button>
        </div>

        <div v-if="trackedStocks.length === 0" class="text-center text-slate-500 py-8">
          尚無追蹤的股票
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StockCard
            v-for="stock in trackedStocks"
            :key="stock.code"
            :stock="stock"
            @click="selectStock(stock.code)"
            @remove="removeStock(stock.code)"
          />
        </div>
      </div>
    </main>

    <!-- Add Stock Dialog -->
    <div v-if="showAddDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/30">
        <h3 class="text-xl font-semibold text-white mb-4">新增股票</h3>
        <div class="space-y-4">
          <input
            v-model="newStockCode"
            type="text"
            placeholder="股票代碼 (例如: 2330)"
            class="w-full bg-slate-900/50 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <input
            v-model="newStockName"
            type="text"
            placeholder="股票名稱 (選填)"
            class="w-full bg-slate-900/50 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showAddDialog = false"
            class="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-3 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            @click="addStock"
            class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-4 py-3 rounded-xl transition-all"
          >
            新增
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import StockChart from '../components/StockChart.vue'
import StockCard from '../components/StockCard.vue'

const router = useRouter()

const searchCode = ref('')
const loading = ref(false)
const error = ref('')
const showAddDialog = ref(false)
const newStockCode = ref('')
const newStockName = ref('')
const trackedStocks = ref([])
const currentStock = ref(null)
const chartData = ref([])
const currentTime = ref('')

let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  loadTrackedStocks()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

const loadTrackedStocks = async () => {
  try {
    const response = await api.getTrackedStocks()
    if (response.data.success) {
      trackedStocks.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to load tracked stocks:', err)
  }
}

const searchStock = async () => {
  if (!searchCode.value.trim()) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.getQuote(searchCode.value.trim().toUpperCase())
    if (response.data.success) {
      currentStock.value = response.data.data
      
      // Fetch K-line data for chart
      try {
        const kbarsResponse = await api.getKbars(searchCode.value.trim().toUpperCase())
        if (kbarsResponse.data?.data?.kbars) {
          chartData.value = kbarsResponse.data.data.kbars.map(d => ({
            time: d.date,
            open: parseFloat(d.open),
            high: parseFloat(d.high),
            low: parseFloat(d.low),
            close: parseFloat(d.close),
            volume: parseInt(d.volume)
          })).reverse() // Oldest first
        }
      } catch (kbErr) {
        console.error('Failed to fetch kbars:', kbErr)
        chartData.value = []
      }
    } else {
      error.value = response.data.message || '找不到股票'
    }
  } catch (err) {
    error.value = err.response?.data?.message || '查詢失敗'
  } finally {
    loading.value = false
  }
}

const selectStock = (code) => {
  searchCode.value = code
  searchStock()
}

const addStock = async () => {
  if (!newStockCode.value.trim()) return
  
  try {
    const response = await api.addStock(newStockCode.value, newStockName.value || newStockCode.value)
    if (response.data.success) {
      loadTrackedStocks()
      showAddDialog.value = false
      newStockCode.value = ''
      newStockName.value = ''
    }
  } catch (err) {
    error.value = err.response?.data?.message || '新增失敗'
  }
}

const removeStock = async (code) => {
  try {
    await api.removeStock(code)
    loadTrackedStocks()
  } catch (err) {
    console.error('Failed to remove stock:', err)
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
</style>