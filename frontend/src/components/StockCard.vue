<template>
  <div 
    class="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/30 cursor-pointer hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between mb-3">
      <div>
        <h4 class="text-xl font-bold text-white">{{ stock.code }}</h4>
        <p class="text-slate-400 text-sm">{{ stock.name }}</p>
      </div>
      <button 
        @click.stop="$emit('remove')"
        class="text-slate-500 hover:text-red-400 transition-colors p-1"
        title="移除"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="flex items-end justify-between">
      <div class="text-2xl font-bold" :class="stock.change >= 0 ? 'text-green-400' : 'text-red-400'">
        {{ stock.currentPrice }}
      </div>
      <div class="text-right">
        <div class="text-sm" :class="stock.change >= 0 ? 'text-green-400' : 'text-red-400'">
          {{ stock.change >= 0 ? '+' : '' }}{{ stock.change }}
        </div>
        <div class="text-xs" :class="stock.change >= 0 ? 'text-green-400/70' : 'text-red-400/70'">
          {{ stock.changePercent }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stock: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'remove'])
</script>