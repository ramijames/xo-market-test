<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

interface Props {
  state?: string
  pulse?: string
  round?: string
}

withDefaults(defineProps<Props>(), {
  state: 'Open',
  pulse: 'Active',
  round: '#848',
})

const secondsLeft = ref(2700)
let timer: ReturnType<typeof setInterval> | null = null

const displayTime = computed(() => {
  const min = Math.floor(secondsLeft.value / 60)
  const sec = secondsLeft.value % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

const flipFlags = ref<boolean[]>([false, false, false, false, false])
const digits = computed(() => displayTime.value.split(''))

watch(displayTime, (newVal, oldVal) => {
  const newD = newVal.split('')
  const oldD = oldVal.split('')
  for (let i = 0; i < newD.length; i++) {
    flipFlags.value[i] = newD[i] !== oldD[i]
  }
  nextTick(() => {
    setTimeout(() => {
      flipFlags.value = [false, false, false, false, false]
    }, 400)
  })
})

const isUrgent = computed(() => secondsLeft.value <= 60)
const isCritical = computed(() => secondsLeft.value <= 10)

// Wedge represents elapsed time (gray) over a pink-filled circle
const pieArc = computed(() => {
  const remaining = secondsLeft.value / 3600
  const elapsed = 1 - remaining

  if (elapsed <= 0) return ''
  if (elapsed >= 1) return `M12 2 A10 10 0 1 1 11.999 2 Z`

  const angle = elapsed * 2 * Math.PI
  const x = 12 + 10 * Math.sin(angle)
  const y = 12 - 10 * Math.cos(angle)
  const largeArc = elapsed > 0.5 ? 1 : 0

  return `M12 12 L12 2 A10 10 0 ${largeArc} 1 ${x} ${y} Z`
})

onMounted(() => {
  timer = setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value--
    } else if (timer) {
      clearInterval(timer)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="status-bar">
    <div class="status-inner">
      <div class="status-item">
        <span class="status-icon">
          <!-- Pie timer icon -->
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#ff87a6" stroke="#000000" stroke-width="1"/>
            <path v-if="pieArc" :d="pieArc" fill="#e5e7eb"/>
            <circle cx="12" cy="12" r="10" fill="none" stroke="#000000" stroke-width="1"/>
          </svg>
        </span>
        <span class="status-label">Time left</span>
        <span class="timer-value" :class="{ urgent: isUrgent, critical: isCritical }">
          <span
            v-for="(digit, i) in digits"
            :key="i"
            class="flip-digit"
            :class="{ 'is-colon': digit === ':', flip: flipFlags[i] }"
          >{{ digit }}</span>
        </span>
      </div>

      <div class="status-item">
        <span class="status-icon">
          <img src="/star.png" width="34" height="34" alt="State" />
        </span>
        <span class="status-label">State</span>
        <span class="status-value">{{ state }}</span>
      </div>

      <div class="status-item">
        <span class="status-icon">
          <img src="/pulse.png" width="34" height="34" alt="Pulse" />
        </span>
        <span class="status-label">Pulse</span>
        <span class="status-value">{{ pulse }}</span>
      </div>

      <div class="status-item">
        <span class="status-icon">
          <img src="/round.png" width="34" height="34" alt="Round" />
        </span>
        <span class="status-label">Round</span>
        <span class="status-value">{{ round }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  border-bottom: 10px solid #ff87a6;
  background: #fff;
}

.status-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 80px;
  padding: 30px 32px;
  max-width: 1280px;
  margin: 0 auto;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 20px;
}

.status-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.status-label {
  color: #9ca3af;
  font-weight: 400;
}

.status-value {
  color: #111827;
  font-weight: 700;
}

.timer-value {
  display: flex;
  align-items: center;
  gap: 2px;
}

.flip-digit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 32px;
  background: #1a1a2e;
  color: #fff;
  border-radius: 3px;
  font-size: 18px;
  font-weight: 700;
  font-family: 'IBM Plex Mono', monospace;
}

.flip-digit.is-colon {
  width: 12px;
  background: transparent;
  color: #111827;
}

.flip-digit.flip {
  animation: flip-tick 0.4s ease-in-out;
}

.timer-value.urgent .flip-digit:not(.is-colon) {
  background: #92400e;
}

.timer-value.urgent .flip-digit.is-colon {
  color: #f59e0b;
}

.timer-value.critical .flip-digit:not(.is-colon) {
  background: #991b1b;
  animation: shake 0.5s ease-in-out infinite;
}

.timer-value.critical .flip-digit.is-colon {
  color: #ef4444;
}

@keyframes flip-tick {
  0% { transform: perspective(200px) rotateX(0deg); }
  50% { transform: perspective(200px) rotateX(-90deg); opacity: 0.5; }
  100% { transform: perspective(200px) rotateX(0deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}
</style>
