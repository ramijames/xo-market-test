<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'

const userTrade = ref<{ direction: 'Up' | 'Down'; amount: number; timestamp: number } | null>(null)

function onConfirm(payload: { direction: 'Up' | 'Down'; amount: number }) {
  userTrade.value = { ...payload, timestamp: Date.now() }
}
</script>

<template>
  <AppHeader />
  <RouterView />
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #F4F4F4;
  color: #111827;
}
</style>
