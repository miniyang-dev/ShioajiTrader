<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <div class="logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h18v18H3V3z" stroke="currentColor" stroke-width="2"/>
            <path d="M3 9h18M9 3v18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="logo-text">ShioajiTrader</span>
      </div>

      <div class="header-right">
        <div class="live-badge">
          <span class="live-dot"></span>
          <span>Live</span>
        </div>
        <div class="time-display">{{ currentTime }}</div>
        <button class="btn-logout" @click="handleLogout">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Logout
        </button>
      </div>
    </header>

    <!-- Main content -->
    <div class="main-grid">
      <!-- Left column -->
      <div class="left-col">
        <!-- Stats row -->
        <div class="stats-row">
          <div class="stat-card" v-for="stat in stats" :key="stat.label">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
            <div class="stat-delta" :class="stat.direction">
              <svg v-if="stat.direction === 'up'" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 2L9 8H1L5 2Z" fill="currentColor"/>
              </svg>
              <svg v-else-if="stat.direction === 'down'" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 8L1 2H9L5 8Z" fill="currentColor"/>
              </svg>
              {{ stat.change }}
            </div>
          </div>
        </div>

        <!-- Chart section -->
        <div class="glass-card chart-section">
          <div class="section-header">
            <h2 class="section-title">TAIEX Index</h2>
            <div class="tabs">
              <button v-for="tab in ['1D', '1W', '1M', '1Y']" 
                      :key="tab"
                      class="tab"
                      :class="{ active: activeTab === tab }"
                      @click="activeTab = tab">
                {{ tab }}
              </button>
            </div>
          </div>
          <div class="chart-area">
            <svg class="chart-svg" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,90 C40,80 60,70 100,55 C140,40 160,50 200,45 C240,40 280,35 320,28 C360,21 400,15 L400,120 L0,120 Z" fill="url(#chartGradient)"/>
              <path d="M0,90 C40,80 60,70 100,55 C140,40 160,50 200,45 C240,40 280,35 320,28 C360,21 400,15" fill="none" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="400" cy="15" r="4" fill="#3b82f6"/>
            </svg>
          </div>
        </div>

        <!-- Holdings -->
        <div class="glass-card holdings-section">
          <div class="section-header">
            <h2 class="section-title">Positions</h2>
            <div class="tabs">
              <button v-for="tab in ['All', 'Long', 'Short']" 
                      :key="tab"
                      class="tab"
                      :class="{ active: activePositionTab === tab }"
                      @click="activePositionTab = tab">
                {{ tab }}
              </button>
            </div>
          </div>
          <div class="holdings-list">
            <div class="holding-row" v-for="holding in holdings" :key="holding.code">
              <div class="holding-left">
                <div class="ticker-badge">{{ holding.code }}</div>
                <div class="ticker-info">
                  <span class="ticker-name">{{ holding.name }}</span>
                  <span class="ticker-code">{{ holding.exchange }}</span>
                </div>
              </div>
              <div class="holding-right">
                <span class="ticker-price">{{ holding.price }}</span>
                <span class="ticker-change" :class="holding.change >= 0 ? 'up' : 'down'">
                  {{ holding.change >= 0 ? '+' : '' }}{{ holding.changePercent }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="right-col">
        <!-- Order book -->
        <div class="glass-card order-book">
          <div class="section-header">
            <h2 class="section-title">Order Book</h2>
          </div>
          <div class="order-book-inner">
            <div class="ob-header">
              <span>Bid</span>
              <span style="text-align:center">Price</span>
              <span style="text-align:right">Ask</span>
            </div>
            <div class="ob-row" v-for="row in orderBook" :key="row.price">
              <span class="ob-bid">{{ row.bidSize }}</span>
              <span class="ob-price" :class="{ highlight: row.current }">{{ row.price }}</span>
              <span class="ob-ask">{{ row.askSize }}</span>
            </div>
          </div>
        </div>

        <!-- Quick order -->
        <div class="glass-card quick-order">
          <div class="section-header">
            <h2 class="section-title">Quick Order</h2>
          </div>
          <div class="order-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Stock</label>
                <input v-model="orderForm.stock" type="text" class="form-input" placeholder="2330">
              </div>
              <div class="form-group">
                <label class="form-label">Quantity</label>
                <input v-model="orderForm.quantity" type="number" class="form-input" placeholder="1">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Price</label>
                <input v-model="orderForm.price" type="number" class="form-input" placeholder="Market">
              </div>
            </div>
            <div class="order-buttons">
              <button class="btn-buy" @click="handleOrder('buy')">Buy</button>
              <button class="btn-sell" @click="handleOrder('sell')">Sell</button>
            </div>
          </div>
        </div>

        <!-- Recent trades -->
        <div class="glass-card recent-trades">
          <div class="section-header">
            <h2 class="section-title">Recent Fills</h2>
          </div>
          <div class="trades-list">
            <div class="trade-row" v-for="trade in trades" :key="trade.id">
              <span class="trade-time">{{ trade.time }}</span>
              <span class="trade-side" :class="trade.side.toLowerCase()">{{ trade.side }}</span>
              <span class="trade-symbol">{{ trade.symbol }}</span>
              <span class="trade-qty">x{{ trade.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('1D')
const activePositionTab = ref('All')
const currentTime = ref('')

let timeInterval = null

const stats = reactive([
  { label: 'Portfolio Value', value: '$1,234,567', change: '+2.34%', direction: 'up', color: '#fafafa' },
  { label: "Today's P&L", value: '+$12,345', change: '+1.82%', direction: 'up', color: '#22c55e' },
  { label: 'Positions', value: '8', change: '6 long / 2 short', direction: 'neutral', color: '#fafafa' },
  { label: 'Available', value: '$98,765', change: 'buying power', direction: 'neutral', color: '#fafafa' }
])

const holdings = reactive([
  { code: '2330', name: 'Taiwan Semiconductor', exchange: 'TSMC', price: '$1,050', change: 45, changePercent: 4.48 },
  { code: '2317', name: 'Foxconn', exchange: 'Foxconn', price: '$185', change: 3.5, changePercent: 1.93 },
  { code: '2454', name: 'MediaTek', exchange: 'MTK', price: '$1,280', change: -15, changePercent: -1.16 },
  { code: '2618', name: 'CDIB Financial', exchange: 'CDIB', price: '$13.85', change: 0.25, changePercent: 1.84 }
])

const orderBook = reactive([
  { price: '21,450', bidSize: '245', askSize: '-', current: false },
  { price: '21,445', bidSize: '312', askSize: '-', current: false },
  { price: '21,440', bidSize: '528', askSize: '-', current: false },
  { price: '21,435', bidSize: '189', askSize: '-', current: true },
  { price: '21,430', bidSize: '-', askSize: '421', current: false },
  { price: '21,425', bidSize: '-', askSize: '356', current: false },
  { price: '21,420', bidSize: '-', askSize: '289', current: false }
])

const orderForm = reactive({
  stock: '',
  quantity: '',
  price: ''
})

const trades = reactive([
  { id: 1, time: '16:08:32', side: 'BUY', symbol: '2330', quantity: 1 },
  { id: 2, time: '16:07:15', side: 'SELL', symbol: '2317', quantity: 2 },
  { id: 3, time: '16:05:48', side: 'BUY', symbol: '2454', quantity: 1 },
  { id: 4, time: '16:03:22', side: 'BUY', symbol: '2618', quantity: 5 }
])

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '/')
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const handleOrder = (side) => {
  console.log(`${side} order:`, orderForm)
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
/* Variables */
:root {
  --bg-base: #09090b;
  --bg-elevated: #18181b;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-medium: rgba(255, 255, 255, 0.1);
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --success: #22c55e;
  --danger: #ef4444;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --radius-md: 10px;
  --radius-lg: 16px;
}

.dashboard {
  min-height: 100vh;
  background: var(--bg-base);
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(9, 9, 11, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--success);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.time-display {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

/* Main grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 20px 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.left-col, .right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-card {
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s, transform 0.2s;
}

.stat-card:hover {
  border-color: var(--border-medium);
  transform: translateY(-1px);
}

.stat-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}

.stat-delta {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-delta.up { color: var(--success); }
.stat-delta.down { color: var(--danger); }
.stat-delta.neutral { color: var(--text-muted); }

/* Glass card */
.glass-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
  box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.glass-card:hover {
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08);
}

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: var(--accent);
  border-radius: 2px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
}

.tab {
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.tab.active {
  background: var(--accent);
  color: white;
}

.tab:not(.active):hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
}

/* Chart */
.chart-section .chart-area {
  padding: 20px;
}

.chart-svg {
  width: 100%;
  height: 180px;
}

/* Holdings */
.holdings-section .holdings-list {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.holding-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.holding-row:hover {
  background: rgba(255,255,255,0.03);
  border-color: var(--border-subtle);
}

.holding-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ticker-badge {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
}

.ticker-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ticker-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.ticker-code {
  font-size: 10px;
  color: var(--text-muted);
}

.holding-right {
  text-align: right;
}

.ticker-price {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.ticker-change {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.ticker-change.up { color: var(--success); }
.ticker-change.down { color: var(--danger); }

/* Order book */
.order-book-inner {
  padding: 12px 16px;
}

.ob-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 6px;
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ob-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  border-bottom: 1px solid rgba(255,255,255,0.02);
  transition: background 0.15s;
}

.ob-row:hover {
  background: rgba(255,255,255,0.02);
}

.ob-bid { color: var(--success); }
.ob-ask { color: var(--danger); }
.ob-price { color: var(--text-secondary); text-align: center; }
.ob-price.highlight {
  color: var(--text-primary);
  font-weight: 700;
  background: rgba(59, 130, 246, 0.15);
  padding: 2px 8px;
  border-radius: 5px;
}

/* Quick order */
.order-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.2s;
  font-variant-numeric: tabular-nums;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  border-color: var(--accent);
}

.order-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-buy, .btn-sell {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-buy {
  color: white;
  background: var(--success);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-buy:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
}

.btn-sell {
  color: white;
  background: var(--danger);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-sell:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Recent trades */
.trades-list {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
}

.trade-row {
  display: grid;
  grid-template-columns: 60px 40px 1fr 40px;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.02);
  font-size: 12px;
}

.trade-time {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.trade-side {
  font-size: 9px;
  font-weight: 700;
  text-align: center;
  padding: 3px 6px;
  border-radius: 4px;
}

.trade-side.buy {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
}

.trade-side.sell {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.trade-symbol {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.trade-qty {
  text-align: right;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .right-col {
    order: -1;
  }
}

@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>