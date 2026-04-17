<template>
  <div class="chart-wrapper">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
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

const initChart = () => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: '#64748b',
      fontFamily: 'Geist, system-ui, sans-serif',
    },
    grid: {
      vertLines: { color: 'rgba(148, 163, 184, 0.08)' },
      horzLines: { color: 'rgba(148, 163, 184, 0.08)' },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: 'rgba(59, 130, 246, 0.5)',
        labelBackgroundColor: '#3b82f6',
      },
      horzLine: {
        color: 'rgba(59, 130, 246, 0.5)',
        labelBackgroundColor: '#3b82f6',
      },
    },
    rightPriceScale: {
      borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    timeScale: {
      borderColor: 'rgba(148, 163, 184, 0.1)',
      timeVisible: true,
      secondsVisible: false,
    },
    handleScroll: {
      vertTouchDrag: false,
    },
  })

  candlestickSeries = chart.addCandlestickSeries({
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderUpColor: '#22c55e',
    borderDownColor: '#ef4444',
    wickUpColor: 'rgba(34, 197, 94, 0.6)',
    wickDownColor: 'rgba(239, 68, 68, 0.6)',
  })

  volumeSeries = chart.addHistogramSeries({
    color: '#3b82f6',
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
  const resizeObserver = new ResizeObserver(entries => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ 
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight 
      })
    }
  })
  
  resizeObserver.observe(chartContainer.value)
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
    color: d.close >= d.open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
  }))

  candlestickSeries.setData(candleData)
  volumeSeries.setData(volumeData)
  chart.timeScale().fitContent()
}

watch(() => props.data, () => {
  if (props.data.length > 0) {
    if (chart) {
      updateChart()
    } else {
      initChart()
    }
  }
}, { deep: true })

onMounted(() => {
  if (props.data.length > 0) {
    initChart()
  }
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>
