<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  userTrade?: { direction: 'Up' | 'Down'; amount: number; timestamp: number } | null
}

withDefaults(defineProps<Props>(), {
  userTrade: null,
})

interface Trade {
  id: number
  address: string
  direction: 'Up' | 'Down'
  amount: number
  timestamp: number
}

let nextId = 0
const trades = ref<Trade[]>([])
let interval: ReturnType<typeof setInterval> | null = null

function randomAddress(): string {
  const hex = '0123456789abcdef'
  let addr = ''
  for (let i = 0; i < 4; i++) addr += hex[Math.floor(Math.random() * 16)]
  return `0x...${addr}`
}

function randomTrade(): Trade {
  const amounts = [25, 50, 75, 100, 150, 200, 250, 500]
  return {
    id: nextId++,
    address: randomAddress(),
    direction: Math.random() > 0.4 ? 'Up' : 'Down',
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    timestamp: Date.now(),
  }
}

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`
  return String(n)
}

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return `${sec}s`
  return `${Math.floor(sec / 60)}m`
}

// Refresh time display
const now = ref(Date.now())
let tickInterval: ReturnType<typeof setInterval> | null = null

const upPercent = ref(62)

onMounted(() => {
  // Seed initial trades
  const seed: Trade[] = []
  for (let i = 0; i < 5; i++) {
    const t = randomTrade()
    t.timestamp = Date.now() - (i + 1) * 15000
    seed.push(t)
  }
  trades.value = seed

  // Add new trades periodically
  interval = setInterval(() => {
    trades.value = [randomTrade(), ...trades.value.slice(0, 6)]
    upPercent.value = Math.min(85, Math.max(30, upPercent.value + (Math.random() - 0.45) * 5))
  }, 3000 + Math.random() * 2000)

  tickInterval = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (tickInterval) clearInterval(tickInterval)
})
</script>

<template>
  <div class="community">

    <!-- Live trades header -->
    <div class="trades-header">
      <h3 class="trades-title">Live trades</h3>
      <p class="trades-subtitle">See what your community thinks</p>
    </div>

    <!-- Conviction bar -->
    <div class="conviction-bar">
      <div class="conviction-fill-up" :style="{ width: upPercent + '%' }"></div>
      <div class="conviction-fill-down" :style="{ width: (100 - upPercent) + '%' }"></div>
      <span class="conviction-label">Community conviction</span>
    </div>

    <!-- Trades list -->
    <div class="trades-list">
      <!-- Your trade (pinned, shown after confirm) -->
      <div v-if="userTrade" class="trade-row your-trade">
        <span class="trade-icon" :class="userTrade.direction.toLowerCase()">
          <svg v-if="userTrade.direction === 'Up'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </span>
        <span class="trade-address">Your trade</span>
        <span class="trade-direction">{{ userTrade.direction }}</span>
        <span class="trade-amount">${{ formatAmount(userTrade.amount) }}</span>
        <span class="trade-time">{{ timeAgo(userTrade.timestamp) }}</span>
      </div>

      <TransitionGroup name="trade" tag="div" class="trades-dynamic">
        <div
          v-for="(trade, i) in trades.slice(0, 5)"
          :key="trade.id"
          class="trade-row"
          :class="{ fading: i >= 3 }"
          :style="i === 4 ? { opacity: 0.3 } : i === 3 ? { opacity: 0.6 } : {}"
        >
          <span class="trade-icon" :class="trade.direction.toLowerCase()">
            <svg v-if="trade.direction === 'Up'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </span>
          <span class="trade-address">{{ trade.address }}</span>
          <span class="trade-direction" :class="trade.direction.toLowerCase()">{{ trade.direction }}</span>
          <span class="trade-amount">${{ formatAmount(trade.amount) }}</span>
          <span class="trade-time">{{ timeAgo(trade.timestamp) }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.community {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

/* Conviction bar */
.conviction-bar {
  position: relative;
  display: flex;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-bottom: 28px;
}

.conviction-fill-up {
  background: #d5f5e3;
  transition: width 0.5s ease;
}

.conviction-fill-down {
  background: #fbd5e8;
  transition: width 0.5s ease;
}

.conviction-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  color: #374151;
  pointer-events: none;
}

/* Trades header */
.trades-header {
  margin-bottom: 20px;
}

.trades-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.trades-subtitle {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* Trades list */
.trades-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.trades-dynamic {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.trade-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 6px;
  border-top: 1px solid #f3f4f6;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  transition: opacity 0.5s ease;
}

.trade-row.your-trade {
  background: #ecfdf5;
  border-radius: 8px;
  border-top: none;
}

.trade-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.trade-icon.up {
  color: #1a7a42;
  background: #d5f5e3;
}

.trade-icon.down {
  color: #b51d5e;
  background: #fbd5e8;
}

.trade-address {
  flex: 1;
  color: #6b7280;
}

.your-trade .trade-address {
  color: #111827;
  font-weight: 700;
}

.trade-direction {
  font-weight: 700;
  width: 50px;
  color: #111827;
}

.trade-amount {
  width: 60px;
  text-align: right;
  font-weight: 700;
  color: #111827;
}

.trade-time {
  width: 36px;
  text-align: right;
  color: #9ca3af;
  font-size: 13px;
}

/* Transition for new trades */
.trade-enter-active {
  transition: all 0.4s ease;
}

.trade-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.trade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.trade-leave-to {
  opacity: 0;
}

.trade-move {
  transition: transform 0.4s ease;
}
</style>
