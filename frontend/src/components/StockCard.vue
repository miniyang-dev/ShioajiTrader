<template>
  <div 
    class="stock-card card-hover"
    @click="$emit('click')"
  >
    <div class="card-main">
      <div class="stock-info">
        <div class="stock-code">{{ stock.code }}</div>
        <div class="stock-name">{{ stock.name }}</div>
      </div>
      <div class="stock-price" :class="priceClass">
        {{ formatPrice(stock.currentPrice) }}
      </div>
    </div>
    <div class="card-footer">
      <div class="stock-change" :class="priceClass">
        <svg v-if="stock.change >= 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        <span>{{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}</span>
        <span class="percent">({{ stock.changePercent.toFixed(2) }}%)</span>
      </div>
      <button 
        @click.stop="$emit('remove')"
        class="remove-btn"
        title="Remove from watchlist"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stock: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'remove'])

const priceClass = computed(() => {
  if (props.stock.change > 0) return 'up'
  if (props.stock.change < 0) return 'down'
  return 'neutral'
})

const formatPrice = (price) => {
  return price ? price.toFixed(2) : '0.00'
}
</script>

<style scoped>
.stock-card {
  padding: 1.25rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stock-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 
    0 20px 40px -15px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(59, 130, 246, 0.1);
}

.card-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stock-code {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.stock-name {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.stock-price {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stock-change {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.stock-change svg {
  width: 16px;
  height: 16px;
}

.stock-change .percent {
  font-weight: 400;
  opacity: 0.8;
}

.up { color: #22c55e; }
.down { color: #ef4444; }
.neutral { color: #94a3b8; }

.remove-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 0.375rem;
  padding: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn svg {
  width: 14px;
  height: 14px;
  color: #64748b;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.remove-btn:hover svg {
  color: #fca5a5;
}
</style>
