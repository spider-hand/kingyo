<template>
  <div class="w-full max-w-md">
    <canvas ref="chartRef" :width="size" :height="size"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Chart, type ChartConfiguration } from 'chart.js/auto'
import { onMounted, onUnmounted, watch, computed, type PropType, ref } from 'vue'

interface ChartData {
  label: string
  value: number
  color: string
}

const props = defineProps({
  data: {
    type: Array as PropType<ChartData[]>,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  }
})

let chart: Chart | null = null
const chartRef = ref<HTMLCanvasElement | null>(null)

const filteredData = computed(() => {
  return props.data.filter(item => item.value > 0)
})

const labels = computed(() => {
  return filteredData.value.map(item => item.label)
})

const values = computed(() => {
  return filteredData.value.map(item => item.value)
})

const backgroundColors = computed(() => {
  return filteredData.value.map(item => item.color)
})

const createChart = () => {
  if (!chartRef.value) return

  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: labels.value,
      datasets: [
        {
          data: values.value,
          backgroundColor: backgroundColors.value,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            font: {
              size: 12,
            },
            color: 'oklch(0.129 0.042 264.695)',
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = filteredData.value.reduce((sum, item) => sum + item.value, 0)
              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0'
              return `${context.parsed} (${percentage}%)`
            },
          },
        },
      },
    },
  }

  chart = new Chart(chartRef.value, config)
}

const updateChart = () => {
  if (!chart) return

  chart.data.labels = labels.value
  chart.data.datasets[0].data = values.value
  chart.data.datasets[0].backgroundColor = backgroundColors.value
  chart.update()
}

watch(() => props.data, updateChart, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>
