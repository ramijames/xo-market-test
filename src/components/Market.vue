<script setup lang="ts">
import MarketTrend from './MarketTrend.vue'
import Community from './Community.vue'

interface Props {
  userTrade?: { direction: 'Up' | 'Down'; amount: number; timestamp: number } | null
}

withDefaults(defineProps<Props>(), {
  userTrade: null,
})
</script>

<template>
  <div class="market">
    <div class="market-inner">
      <div class="market-left">
        <MarketTrend />
      </div>
      <div class="market-right">
        <Community :user-trade="userTrade" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.market {
  padding: 0 32px 40px;
}

.market-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  gap: 40px;
  padding: 0 32px;
}

.market-left {
  flex: 5;
  display: flex;
}

.market-left > :deep(*) {
  flex: 1;
}

.market-right {
  flex: 3;
  display: flex;
}

.market-right > :deep(*) {
  flex: 1;
}
</style>
