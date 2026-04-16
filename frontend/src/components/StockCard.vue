<template>
  <div class="stock-card" :class="{ selected }" @click="$emit('click')">
    <div class="card-header">
      <div class="ticker-badge">{{ stock.code }}</div>
      <div class="ticker-info">
        <span class="ticker-name">{{ stock.name }}</span>
        <span class="ticker-exchange">{{ stock.exchange }}</span>
      </div>
    </div>
    
    <div class="card-body">
      <div class="price-section">
        <span class="current-price">{{ stock.price }}</span>
        <span class="price-currency">USD</span>
      </div>
      
      <div class="change-section">
        <span class="change-badge" :class="stock.change >= 0 ? 'up' : 'down'">
          <svg v-if="stock.change >= 0" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 2L9 8H1L5 2Z" fill="currentColor"/>
          </svg>
          <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 8L1 2H9L5 8Z" fill="currentColor"/>
          </svg>
          {{ stock.change >= 0 ? '+' : '' }}{{ stock.changePercent }}%
        </span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="metric">
        <span class="metric-label">Volume</span>
        <span class="metric-value">{{ stock.volume }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">High</span>
        <span class="metric-value">{{ stock.high }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Low</span>
        <span class="metric-value">{{ stock.low }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stock: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.stock-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.stock-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.stock-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ticker-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
}

.ticker-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ticker-name {
  font-size: 14px;
  font-weight: 600;
  color: #fafafa;
}

.ticker-exchange {
  font-size: 10px;
  color: #71717a;
}

/* Body */
.card-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #fafafa;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.price-currency {
  font-size: 12px;
  color: #71717a;
}

.change-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.change-badge.up {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.change-badge.down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Footer */
.card-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 9px;
  font-weight: 500;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-value {
  font-size: 12px;
  font-weight: 600;
  color: #a1a1aa;
  font-variant-numeric: tabular-nums;
}
</style>