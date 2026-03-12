<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navLinks = [
  { label: 'Markets', to: '/markets' },
  { label: 'Crowdfeed', to: '/crowdfeed' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Pulse', to: '/pulse' },
]
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <a href="/" class="logo">
        <img src="/xo-logo.svg" alt="XO Market" height="38" />
      </a>

      <nav class="nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="actions">
        <button class="deposit-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Deposit
        </button>

        <button class="icon-btn notification-btn" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M8 16a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span class="badge">1</span>
        </button>

        <button class="icon-btn profile-btn" aria-label="Profile">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M4 19c0-3.866 3.134-7 7-7h0a7 7 0 0 1 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 64px;
  max-width: 1280px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo img {
  display: block;
}

.nav {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-link {
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  text-decoration: none;
  position: relative;
  padding-bottom: 4px;
  white-space: nowrap;
}

.nav-link.active {
  font-weight: 700;
  color: #111827;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: #ff87a6;
  border-radius: 2px 2px 0 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.deposit-btn {
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 20px;
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

.deposit-btn:hover {
  transform: translateY(-3px) translateX(-3px);
  box-shadow: 6px 6px 0px #000000;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  border-radius: 50%;
  position: relative;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #ff87a6;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
