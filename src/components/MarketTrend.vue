<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Props {
  openingValue?: number
  unit?: string
}

const props = withDefaults(defineProps<Props>(), {
  openingValue: 66.2,
  unit: 'GWEI',
})

// Generate simulated step-line data points
const dataPoints = ref<number[]>([])
const currentValue = computed(() => {
  if (dataPoints.value.length === 0) return props.openingValue
  return dataPoints.value[dataPoints.value.length - 1]
})

const isUp = computed(() => currentValue.value >= props.openingValue)

let liveInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Generate initial data simulating GWEI fluctuations
  const points: number[] = [props.openingValue]
  let val = props.openingValue
  for (let i = 1; i < 30; i++) {
    val += (Math.random() - 0.48) * 0.6
    val = Math.max(62.5, Math.min(67.5, val))
    points.push(Math.round(val * 10) / 10)
  }
  dataPoints.value = points

  // Add new data points every 2 seconds for live feel
  liveInterval = setInterval(() => {
    const pts = [...dataPoints.value]
    const last = pts[pts.length - 1]
    const next = Math.round(Math.max(62.5, Math.min(67.5, last + (Math.random() - 0.48) * 0.6)) * 10) / 10
    pts.push(next)
    // Keep a sliding window of 40 points
    if (pts.length > 40) pts.shift()
    dataPoints.value = pts
  }, 2000)
})

onUnmounted(() => {
  if (liveInterval) clearInterval(liveInterval)
})

// Chart dimensions — viewBox-based, SVG scales to fill container
const chartW = 620
const chartH = 360
const padL = 70
const padR = 20
const padT = 10
const padB = 30

const yMin = computed(() => {
  const min = Math.min(...dataPoints.value, props.openingValue)
  return Math.floor(min) - 0.5
})

const yMax = computed(() => {
  const max = Math.max(...dataPoints.value, props.openingValue)
  return Math.ceil(max) + 0.5
})

const yTicks = computed(() => {
  const ticks: number[] = []
  for (let v = Math.ceil(yMin.value); v <= Math.floor(yMax.value); v++) {
    ticks.push(v)
  }
  return ticks
})

function toX(i: number): number {
  const count = dataPoints.value.length || 1
  return padL + (i / (count - 1)) * (chartW - padL - padR)
}

function toY(val: number): number {
  const range = yMax.value - yMin.value
  return padT + (1 - (val - yMin.value) / range) * (chartH - padT - padB)
}

const stepPath = computed(() => {
  if (dataPoints.value.length < 2) return ''
  const pts = dataPoints.value
  let d = `M${toX(0)} ${toY(pts[0])}`
  for (let i = 1; i < pts.length; i++) {
    // Step: horizontal then vertical
    d += ` H${toX(i)} V${toY(pts[i])}`
  }
  return d
})

const lastX = computed(() => toX(dataPoints.value.length - 1))
const lastY = computed(() => toY(currentValue.value))

// Draw-in animation
const pathRef = ref<SVGPathElement | null>(null)
const pathLength = ref(0)
const drawOffset = ref(0)
const dotOpacity = ref(0)
const animationDone = ref(false)

watch(stepPath, (val) => {
  if (!val || animationDone.value) return
  nextTick(() => {
    if (!pathRef.value) return
    const len = pathRef.value.getTotalLength()
    pathLength.value = len
    drawOffset.value = len
    // Animate over ~1.2s
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3)
      drawOffset.value = len * (1 - ease)
      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        drawOffset.value = 0
        animationDone.value = true
        // Fade in the dot
        dotOpacity.value = 1
      }
    }
    requestAnimationFrame(tick)
  })
}, { immediate: true })
</script>

<template>
  <div class="market-trend">
    <div class="trend-header">
      <h3 class="trend-title">Market Trend</h3>
      <p class="trend-subtitle">Know which way the wind is blowing</p>
    </div>

    <div class="trend-pills">
      <span class="pill pill-opening">Opening <strong>{{ openingValue }} {{ unit }}</strong></span>
      <span class="pill pill-current" :class="{ up: isUp, down: !isUp }">
        <svg v-if="isUp" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
        Current <strong>{{ currentValue }} {{ unit }}</strong>
      </span>
    </div>

    <div class="chart-wrap">
      <svg :viewBox="`0 0 ${chartW} ${chartH}`" preserveAspectRatio="none" class="chart-svg">
        <!-- Y-axis grid lines and labels -->
        <template v-for="tick in yTicks" :key="tick">
          <line
            :x1="padL"
            :y1="toY(tick)"
            :x2="chartW - padR"
            :y2="toY(tick)"
            stroke="#e5e7eb"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
          <text
            :x="padL - 8"
            :y="toY(tick) + 4"
            text-anchor="end"
            class="chart-label"
          >{{ tick }} {{ unit }}</text>
        </template>

        <!-- X-axis labels -->
        <text :x="padL" :y="chartH - 4" text-anchor="start" class="chart-label">OPENING</text>
        <text :x="chartW - padR" :y="chartH - 4" text-anchor="end" class="chart-label">CURRENT</text>

        <!-- Step line -->
        <path
          v-if="stepPath"
          ref="pathRef"
          :d="stepPath"
          fill="none"
          stroke="#86efac"
          stroke-width="2"
          :stroke-dasharray="animationDone ? 'none' : pathLength"
          :stroke-dashoffset="animationDone ? 0 : drawOffset"
        />

        <!-- Current value dot -->
        <circle
          v-if="dataPoints.length"
          :cx="lastX"
          :cy="lastY"
          r="5"
          fill="#86efac"
          stroke="#fff"
          stroke-width="2"
          :opacity="dotOpacity"
          :style="{ transition: 'opacity 0.3s ease' }"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.market-trend {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.trend-header {
  margin-bottom: 24px;
}

.trend-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.trend-subtitle {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

.trend-pills {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: #374151;
  border: 1.5px solid #d1d5db;
  border-radius: 999px;
  padding: 8px 20px;
}

.pill strong {
  font-weight: 700;
}

.pill-current.up {
  color: #1a7a42;
  border-color: #86efac;
  background: #ecfdf5;
}

.pill-current.down {
  color: #b51d5e;
  border-color: #f9a8d4;
  background: #fce7f3;
}

.chart-wrap {
  overflow: hidden;
  flex: 1;
  display: flex;
  align-items: stretch;
}

.chart-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  fill: #9ca3af;
}
</style>
