<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  lastPulseMessage?: string
  roundNumber?: string
  question?: string
  threshold?: string
  unit?: string
  userTrade?: { direction: 'Up' | 'Down'; amount: number; timestamp: number } | null
}

const props = withDefaults(defineProps<Props>(), {
  lastPulseMessage: 'Last pulse this market went up!',
  roundNumber: '#847',
  question: 'Will the average ETH base fee this hour be higher than at the start of the hour?',
  threshold: '65.5',
  unit: 'GWEI',
  userTrade: null,
})

const emit = defineEmits<{
  (e: 'confirm', payload: { direction: 'Up' | 'Down'; amount: number }): void
}>()

const drawerDirection = ref<'up' | 'down' | null>(null)
const amount = ref('100')

const isOpen = computed(() => drawerDirection.value !== null)

function openDrawer(direction: 'up' | 'down') {
  if (drawerDirection.value === direction) {
    drawerDirection.value = null
  } else {
    drawerDirection.value = direction
  }
}

function setMin() {
  amount.value = '1'
}

function setMax() {
  amount.value = '1000'
}

const notificationRef = ref<HTMLElement | null>(null)
const showConfetti = ref(false)

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; color: string
  rotation: number; rotSpeed: number
  life: number; delay: number
  shape: 'rect' | 'circle' | 'star' | 'strip'
  wobble: number; wobbleSpeed: number
}

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const spikes = 5
  const outer = size
  const inner = size * 0.4
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i * Math.PI) / spikes - Math.PI / 2
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  ctx.closePath()
  ctx.fill()
}

function launchConfetti() {
  showConfetti.value = true
  nextTick(() => {
    const container = notificationRef.value
    if (!container) return
    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const colors: string[] = ['#FF87A6', '#ffb3c6', '#ff6b8a', '#ffd6e0', '#ff4d7a', '#ff3366', '#ffaac4']
    const shapes: Particle['shape'][] = ['rect', 'circle', 'star', 'strip']
    const particles: Particle[] = []

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Three staggered bursts
    for (let burst = 0; burst < 3; burst++) {
      const count = burst === 0 ? 50 : 30
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 4 + Math.random() * 12
        particles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed * (0.8 + burst * 0.3),
          vy: Math.sin(angle) * speed * (0.8 + burst * 0.3) - 4,
          size: 5 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)] as string,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.5,
          life: 1,
          delay: burst * 6,
          shape: shapes[Math.floor(Math.random() * shapes.length)] as Particle['shape'],
          wobble: 0,
          wobbleSpeed: 2 + Math.random() * 4,
        })
      }
    }

    let frameCount = 0
    let frame: number
    function animate() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height)
      frameCount++
      let alive = false
      for (const p of particles) {
        if (p.delay > 0) { p.delay--; alive = true; continue }
        if (p.life <= 0) continue
        alive = true
        p.wobble += p.wobbleSpeed * 0.02
        p.x += p.vx + Math.sin(p.wobble) * 0.8
        p.y += p.vy
        p.vx *= 0.98
        p.vy += 0.18
        p.life -= 0.008
        p.rotation += p.rotSpeed
        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rotation)
        ctx!.globalAlpha = Math.max(0, p.life * p.life)
        ctx!.fillStyle = p.color
        if (p.shape === 'rect') {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else if (p.shape === 'circle') {
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        } else if (p.shape === 'star') {
          drawStar(ctx!, p.size / 2)
        } else {
          ctx!.fillRect(-p.size / 2, -1.5, p.size, 3)
        }
        ctx!.restore()
      }
      if (alive) {
        frame = requestAnimationFrame(animate)
      } else {
        showConfetti.value = false
      }
    }
    frame = requestAnimationFrame(animate)
  })
}

function confirmTrade() {
  if (drawerDirection.value) {
    emit('confirm', {
      direction: drawerDirection.value === 'up' ? 'Up' : 'Down',
      amount: Number(amount.value) || 100,
    })
  }
  drawerDirection.value = null
}

watch(() => props.userTrade, (val) => {
  if (val) {
    nextTick(() => launchConfetti())
  }
})
</script>

<template>
  <div class="buy-panel">
    <div class="buy-inner">
      <div class="col-left">
        <div class="info-badge">
          <span class="badge-text">{{ lastPulseMessage }}</span>
          <span class="round-tag">Round {{ roundNumber }}</span>
        </div>
        <h2 class="market-question">{{ question }}</h2>
      </div>

      <div class="col-right">
        <!-- Notification after trade confirmed -->
        <template v-if="userTrade">
          <div ref="notificationRef" class="trade-notification" :class="userTrade.direction.toLowerCase()">
            <canvas v-if="showConfetti" class="confetti-canvas"></canvas>
            <svg v-if="userTrade.direction === 'Up'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
            <span class="notification-amount">${{ userTrade.amount }}</span>
            <span class="notification-label">Position placed</span>
          </div>
        </template>

        <!-- Buy buttons before trade -->
        <template v-else>
          <div class="info-badge">
            <span class="badge-text">Which way do you think this pulse will go?</span>
          </div>
          <div class="buy-buttons">
            <button class="buy-btn buy-up" :class="{ active: drawerDirection === 'up' }" @click="openDrawer('up')">
              <svg class="btn-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <span class="btn-label">Buy Up</span>
              <span class="btn-threshold">&lt; {{ threshold }} {{ unit }}</span>
            </button>

            <button class="buy-btn buy-down" :class="{ active: drawerDirection === 'down' }" @click="openDrawer('down')">
              <svg class="btn-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
              <span class="btn-label">Buy Down</span>
              <span class="btn-threshold">&gt; {{ threshold }} {{ unit }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <Transition name="drawer">
      <div v-if="isOpen" class="drawer">
        <div class="drawer-inner">
          <div class="drawer-left">
            <div class="drawer-icon" :class="drawerDirection">
              <svg v-if="drawerDirection === 'up'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
            <div class="drawer-text">
              <span class="drawer-title">Make your play</span>
              <span class="drawer-subtitle">
                How confident are you it will go {{ drawerDirection }}?
              </span>
            </div>
          </div>

          <div class="drawer-input-wrap">
            <span class="input-prefix">$</span>
            <input
              v-model="amount"
              type="text"
              class="drawer-input"
              inputmode="numeric"
            />
            <div class="input-actions">
              <button class="input-btn" @click="setMin">MIN</button>
              <button class="input-btn" @click="setMax">MAX</button>
            </div>
          </div>

          <button class="confirm-btn" @click="confirmTrade">Confirm</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.buy-panel {
  padding: 40px 32px;
}

.buy-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  padding: 0 32px;
}

.col-left {
  flex: 5;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.col-right {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.col-right .info-badge {
  justify-content: center;
  border: 1px solid #c1c1c1;
}

.info-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #99DBA7;
  border-radius: 10px;
  padding: 10px;
  height: 54px;
}

.badge-text {
  font-size: 14px;
  font-family: 'IBM Plex Mono', monospace;
  color: #374151;
}

.round-tag {
  display: inline-block;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  padding: 4px 14px;
  font-size: 13px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  color: #111827;
}

.market-question {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: #111827;
  margin: 0;
}

.buy-buttons {
  display: flex;
  gap: 20px;
}

.buy-btn {
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 8px;
  background: #D9FFE1;
  border: 1px solid #000000;
  box-shadow: 3px 3px 0px #000000;
  border-radius: 10px;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  cursor: pointer;
  font-weight: 700;
  font-family: 'IBM Plex Mono', monospace;
}

.buy-btn:hover {
  transform: translateY(-3px) translateX(-3px);
  box-shadow: 6px 6px 0px #000000;
}

.buy-btn:active {
  transform: translateY(0);
}

.buy-up {
  background: #d5f5e3;
  color: #1a7a42;
}

.buy-down {
  background: #fbd5e8;
  color: #b51d5e;
}

.btn-arrow {
  width: 28px;
  height: 28px;
}

.btn-label {
  font-size: 20px;
  font-weight: 700;
}

.btn-threshold {
  font-size: 14px;
  opacity: 0.7;
}

/* Trade notification */
.trade-notification {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ecfdf5;
  border-radius: 10px;
  padding: 32px;
  font-family: 'IBM Plex Mono', monospace;
  position: relative;
  overflow: hidden;
}

.confetti-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.trade-notification.up {
  color: #1a7a42;
  border: 1px solid #99DBA7;
}

.trade-notification.down {
  color: #b51d5e;
  background: #fce7f3;
  border: 1px solid #E35C86;
}

.notification-amount {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.notification-label {
  font-size: 14px;
  color: #6b7280;
}

/* Drawer */
.drawer {
  overflow: hidden;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

.drawer-inner {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 32px 40px;
  background: linear-gradient(135deg, #ecfdf5 0%, #fff 50%);
  border-radius: 16px;
  margin-top: 24px;
}

.drawer-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.drawer-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1.5px solid #99DBA7;
  background: #ecfdf5;
}

.drawer-icon.up {
  color: #1a7a42;
}

.drawer-icon.down {
  color: #b51d5e;
  background: #fce7f3;
  border-color: #f9a8d4;
}

.drawer-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.drawer-subtitle {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #6b7280;
}

.drawer-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  padding: 0 16px;
  height: 54px;
  background: #fff;
}

.input-prefix {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-right: 4px;
}

.drawer-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  background: transparent;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.input-btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}

.input-btn:hover {
  color: #111827;
}

.confirm-btn {
  display: flex;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 32px;
  height: 54px;
  gap: 8px;
  background: #ff87a6;
  border: 1px solid #000000;
  box-shadow: 3px 3px 0px #000000;
  border-radius: 10px;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  cursor: pointer;
  font-weight: 700;
  font-family: 'IBM Plex Mono', monospace;
}

.confirm-btn:hover {
  transform: translateY(-3px) translateX(-3px);
  box-shadow: 6px 6px 0px #000000;
}

/* Drawer transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.drawer-enter-to,
.drawer-leave-from {
  max-height: 200px;
}
</style>
