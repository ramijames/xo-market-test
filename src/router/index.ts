import { createRouter, createWebHistory } from 'vue-router'
import PulseView from '../views/PulseView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/pulse' },
    { path: '/pulse', component: PulseView },
  ],
})

export default router
