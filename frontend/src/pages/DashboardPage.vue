<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#logo-grad)"/>
            <path d="M14 32L24 16L34 32H14Z" fill="white" fill-opacity="0.9"/>
            <circle cx="24" cy="26" r="4" fill="white" fill-opacity="0.6"/>
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
                <stop stop-color="#3B82F6"/>
                <stop offset="1" stop-color="#1D4ED8"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="header-title">
          <h1>Dashboard</h1>
          <span class="timestamp">{{ currentTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <button @click="handleLogout" class="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Search Section -->
      <section class="search-section">
        <div class="search-card">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="searchCode"
              type="text"
              placeholder="Search stock code (e.g. 2330)"
              @keyup.enter="searchStock"
            />
            <button 
              v-if="searchCode"
              @click="searchCode = ''"
              class="clear-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <button 
            @click="searchStock" 
            :disabled="loading || !searchCode.trim()"
            class="search-btn"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Search</span>
          </button>
        </div>
      </section>

      <!-- Error Message -->
      <div v-if="error" class="error-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <!-- Stock Info Grid -->
      <div v-if="currentStock" class="stock-grid">
        <!-- Stock Price Card -->
        <div class="stock-price-card card-hover">
          <div class="card-label">Current Price</div>
          <div class="stock-code">{{ currentStock.code }}</div>
          <div class="stock-name">{{ currentStock.name }}</div>
          <div class="stock-price" :class="priceColorClass">
            {{ formatPrice(currentStock.currentPrice) }}
          </div>
          <div class="stock-change" :class="priceColorClass">
            <svg v-if="currentStock.change >= 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            {{ currentStock.change >= 0 ? '+' : '' }}{{ currentStock.change.toFixed(2) }}
            ({{ currentStock.changePercent.toFixed(2) }}%)
          </div>
        </div>

        <!-- Volume Card -->
        <div class="stat-card card-hover">
          <div class="card-label">Volume</div>
          <div class="stat-value">{{ formatVolume(currentStock.volume) }}</div>
          <div class="stat-desc">shares</div>
        </div>

        <!-- Last Update Card -->
        <div class="stat-card card-hover">
          <div class="card-label">Last Update</div>
          <div class="stat-value">{{ formatTime(currentStock.updatedAt) }}</div>
          <div class="stat-desc">local time</div>
        </div>
      </div>

      <!-- Chart Section -->
      <div v-if="currentStock" class="chart-section">
        <div class="chart-header">
          <h3>K-Line Chart</h3>
          <div class="chart-controls">
            <button 
              v-for="period in ['1D', '1W', '1M', '3M']" 
              :key="period"
              :class="{ active: selectedPeriod === period }"
              @click="selectedPeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <div class="chart-wrapper">
          <StockChart v-if="chartData.length > 0" :data="chartData" />
          <div v-else class="chart-loading">
            <div class="skeleton-chart"></div>
          </div>
        </div>
      </div>

      <!-- Watchlist Section -->
      <section class="watchlist-section">
        <div class="section-header">
          <h3>Watchlist</h3>
          <button @click="showAddDialog = true" class="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        </div>

        <div v-if="trackedStocks.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <p>No stocks in watchlist</p>
          <span>Add stocks to track their performance</span>
        </div>

        <div v-else class="stock-list">
          <StockCard
            v-for="stock in trackedStocks"
            :key="stock.code"
            :stock="stock"
            @click="selectStock(stock.code)"
            @remove="removeStock(stock.code)"
          />
        </div>
      </section>
    </main>

    <!-- Add Stock Dialog -->
    <Teleport to="body">
      <div v-if="showAddDialog" class="dialog-overlay" @click.self="showAddDialog = false">
        <div class="dialog">
          <div class="dialog-header">
            <h4>Add to Watchlist</h4>
            <button @click="showAddDialog = false" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="dialog-body">
            <div class="form-group">
              <label>Stock Code</label>
              <input 
                v-model="newStockCode" 
                type="text" 
                placeholder="e.g. 2330"
                @keyup.enter="addStock"
              />
            </div>
            <div class="form-group">
              <label>Name (optional)</label>
              <input 
                v-model="newStockName" 
                type="text" 
                placeholder="e.g. TSMC"
              />
            </div>
          </div>
          <div class="dialog-footer">
            <button @click="showAddDialog = false" class="cancel-btn">Cancel</button>
            <button @click="addStock" class="confirm-btn">Add</button>
          </div>
        </div>
      </div>
    </Teleport>
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
const selectedPeriod = ref('1M')
const currentTime = ref('')

let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('en-US', { 
    month: 'short', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
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

const priceColorClass = computed(() => {
  if (!currentStock.value) return ''
  if (currentStock.value.change > 0) return 'price-up'
  if (currentStock.value.change < 0) return 'price-down'
  return 'price-neutral'
})

const formatPrice = (price) => {
  return price ? price.toFixed(2) : '0.00'
}

const formatVolume = (vol) => {
  if (!vol) return '0'
  if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M'
  if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K'
  return vol.toString()
}

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--'
  try {
    const date = new Date(timeStr)
    return date.toLocaleTimeString('en-US', { hour12: false })
  } catch {
    return '--:--'
  }
}

const loadTrackedStocks = async () => {
  try {
    const response = await api.getTrackedStocks()
    if (response.data.success) {
      trackedStocks.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to load stocks:', err)
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
          })).reverse()
        }
      } catch (kbErr) {
        console.error('Failed to fetch kbars:', kbErr)
        chartData.value = []
      }
    } else {
      error.value = response.data.message || 'Stock not found'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Query failed'
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
    error.value = err.response?.data?.message || 'Add failed'
  }
}

const removeStock = async (code) => {
  try {
    await api.removeStock(code)
    loadTrackedStocks()
  } catch (err) {
    console.error('Remove failed:', err)
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: flex;
}

.header-title h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.timestamp {
  font-size: 0.75rem;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn svg {
  width: 16px;
  height: 16px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Search Section */
.search-section {
  width: 100%;
}

.search-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1rem;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: #64748b;
}

.search-input-wrapper input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 0.75rem;
  color: #f1f5f9;
  font-size: 1rem;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-btn {
  padding: 0 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.clear-btn svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

/* Error Toast */
.error-toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.75rem;
  color: #fca5a5;
  font-size: 0.875rem;
  animation: slideIn 0.3s ease;
}

.error-toast svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Stock Grid */
.stock-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .stock-grid {
    grid-template-columns: 1fr;
  }
}

.stock-price-card {
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1rem;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.stock-code {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}

.stock-name {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.stock-price {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stock-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
}

.stock-change svg {
  width: 18px;
  height: 18px;
}

.price-up { color: #22c55e; }
.price-down { color: #ef4444; }
.price-neutral { color: #94a3b8; }

.stat-card {
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.stat-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.3);
}

/* Chart Section */
.chart-section {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-controls button {
  padding: 0.375rem 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-controls button:hover {
  border-color: rgba(59, 130, 246, 0.3);
  color: #94a3b8;
}

.chart-controls button.active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

.chart-wrapper {
  height: 400px;
  border-radius: 0.75rem;
  overflow: hidden;
}

.chart-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-chart {
  width: 100%;
  height: 300px;
  background: linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(30, 41, 59, 0.5) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.5rem;
}

/* Watchlist Section */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn svg {
  width: 16px;
  height: 16px;
}

.add-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px dashed rgba(148, 163, 184, 0.2);
  border-radius: 1rem;
  text-align: center;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  color: #475569;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.empty-state span {
  font-size: 0.875rem;
  color: #475569;
}

.stock-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.dialog {
  width: 100%;
  max-width: 400px;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.dialog-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.dialog-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
}

.form-group input {
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 0.5rem;
  color: #f1f5f9;
  font-size: 0.9375rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.dialog-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.cancel-btn:hover {
  background: rgba(148, 163, 184, 0.15);
}

.confirm-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: white;
}

.confirm-btn:hover {
  transform: translateY(-1px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
