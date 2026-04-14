<template>
  <div class="chart-container">
    <div ref="chartContainer" class="w-full h-96"></div>
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-deep-sea/50">
      <div class="skeleton w-full h-full rounded-lg"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createChart } from 'lightweight-charts'

const props = defineProps({
  symbol: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  }
})

const chartContainer = ref(null)
const loading = ref(false)
let chart = null
let candleSeries = null
let volumeSeries = null

const initChart = () => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: 'solid', color: '#0d1117' },
      textColor: '#e6e6e6',
    },
    grid: {
      vertLines: { color: '#1a1f26' },
      horzLines: { color: '#1a1f26' },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: '#6c5ce7',
        width: 1,
        style: 2,
      },
      horzLine: {
        color: '#6c5ce7',
        width: 1,
        style: 2,
      },
    },
    rightPriceScale: {
      borderColor: '#30363d',
    },
    timeScale: {
      borderColor: '#30363d',
      timeVisible: true,
    },
  })

  candleSeries = chart.addCandlestickSeries({
    upColor: '#00b894',
    downColor: '#ff6b6b',
    borderUpColor: '#00b894',
    borderDownColor: '#ff6b6b',
    wickUpColor: '#00b894',
    wickDownColor: '#ff6b6b',
  })

  volumeSeries = chart.addHistogramSeries({
    color: '#6c5ce7',
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: '',
  })

  volumeSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  })

  // Responsive resize
  const resizeObserver = new ResizeObserver((entries) => {
    if (chart && entries[0]) {
      const { width, height } = entries[0].contentRect
      chart.applyOptions({ width, height })
    }
  })

  resizeObserver.observe(chartContainer.value)
}

const updateData = (data) => {
  if (!candleSeries || !volumeSeries || !data.length) return

  const candleData = data.map(d => ({
    time: d.time || d.date,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }))

  const volumeData = data.map(d => ({
    time: d.time || d.date,
    value: d.volume,
    color: d.close >= d.open ? 'rgba(0, 184, 148, 0.5)' : 'rgba(255, 107, 107, 0.5)',
  }))

  candleSeries.setData(candleData)
  volumeSeries.setData(volumeData)
  chart.timeScale().fitContent()
}

onMounted(() => {
  initChart()
  if (props.data.length) {
    updateData(props.data)
  }
})

watch(() => props.data, updateData, { deep: true })

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  min-height: 400px;
}
</style>
