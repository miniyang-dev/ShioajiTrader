<template>
  <div class="chart-wrapper">
    <div ref="chartContainer" class="w-full h-80"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { createChart } from 'lightweight-charts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartContainer = ref(null)
let chart = null
let candlestickSeries = null
let volumeSeries = null

onMounted(() => {
  if (chartContainer.value && props.data.length > 0) {
    initChart()
  }
})

watch(() => props.data, (newData) => {
  if (newData.length > 0) {
    if (chart) {
      updateChart()
    } else {
      initChart()
    }
  }
}, { deep: true })

const initChart = () => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: '#94a3b8',
    },
    grid: {
      vertLines: { color: '#334155' },
      horzLines: { color: '#334155' },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: '#6366f1',
        labelBackgroundColor: '#6366f1',
      },
      horzLine: {
        color: '#6366f1',
        labelBackgroundColor: '#6366f1',
      },
    },
    rightPriceScale: {
      borderColor: '#334155',
    },
    timeScale: {
      borderColor: '#334155',
      timeVisible: true,
    },
  })

  candlestickSeries = chart.addCandlestickSeries({
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderUpColor: '#22c55e',
    borderDownColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
  })

  volumeSeries = chart.addHistogramSeries({
    color: '#6366f1',
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

  updateChart()

  // Handle resize
  window.addEventListener('resize', () => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth })
    }
  })
}

const updateChart = () => {
  if (!candlestickSeries || !volumeSeries || !props.data.length) return

  const candleData = props.data.map(d => ({
    time: d.time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close
  }))

  const volumeData = props.data.map(d => ({
    time: d.time,
    value: d.volume,
    color: d.close >= d.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
  }))

  candlestickSeries.setData(candleData)
  volumeSeries.setData(volumeData)

  chart.timeScale().fitContent()
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  overflow: hidden;
}
</style>