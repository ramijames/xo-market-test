<script setup lang="ts">
import { ref } from 'vue'
import StatusBar from '../components/StatusBar.vue'
import BuyPanel from '../components/BuyPanel.vue'
import Market from '../components/Market.vue'

const userTrade = ref<{ direction: 'Up' | 'Down'; amount: number; timestamp: number } | null>(null)

function onConfirm(payload: { direction: 'Up' | 'Down'; amount: number }) {
  userTrade.value = { ...payload, timestamp: Date.now() }
}
</script>

<template>
  <main class="pulse-view">
    <StatusBar state="Open" pulse="Active" round="#848" />
    <BuyPanel :user-trade="userTrade" @confirm="onConfirm" />
    <Market :user-trade="userTrade" />
  </main>
</template>

<style scoped>
</style>
