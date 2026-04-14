<template>
  <div class="glass-card p-4 hover:border-purple-500/50 transition-colors cursor-pointer">
    <div class="flex justify-between items-start mb-2">
      <div>
        <h3 class="text-lg font-bold text-white">{{ stock.code }}</h3>
        <p class="text-sm text-gray-400">{{ stock.name || stock.code }}</p>
      </div>
      <div class="text-right">
        <p class="text-xl font-bold" :class="priceColorClass">
          {{ formatPrice(stock.currentPrice || stock.price) }}
        </p>
        <p class="text-sm" :class="changeClass">
          {{ formatChange(stock.change, stock.changePercent) }}
        </p>
      </div>
    </div>
    <div class="flex justify-between text-xs text-gray-500 mt-3">
      <span>成交量: {{ formatVolume(stock.volume) }}</span>
      <span>{{ formatTime(stock.updatedAt) }}</span>
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

const isUp = computed(() => (props.stock.change || 0) >= 0)

const priceColorClass = computed(() => 
  isUp.value ? 'text-green-500' : 'text-red-500'
)

const changeClass = computed(() => 
  isUp.value ? 'text-green-500' : 'text-red-500'
)

const formatPrice = (price) => {
  if (!price && price !== 0) return '-'
  return price.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatChange = (change, percent) => {
  if ((!change && change !== 0) || (!percent && percent !== 0)) return '-'
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`
}

const formatVolume = (volume) => {
  if (!volume) return '-'
  if (volume >= 1000000) return (volume / 1000000).toFixed(2) + 'M'
  if (volume >= 1000) return (volume / 1000).toFixed(2) + 'K'
  return volume.toString()
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleTimeString('zh-TW')
}
</script>
