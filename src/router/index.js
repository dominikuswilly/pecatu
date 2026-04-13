import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/kontak',
      name: 'contact',
      component: () => import('@/views/ContactView.vue')
    },
    {
      path: '/layanan',
      name: 'services',
      component: () => import('@/views/MaintenanceView.vue'),
      meta: { title: 'Layanan' }
    },
    {
      path: '/iuran',
      name: 'billing',
      component: () => import('@/views/MaintenanceView.vue'),
      meta: { title: 'Iuran' }
    },
    {
      path: '/berita',
      name: 'news',
      component: () => import('@/views/MaintenanceView.vue'),
      meta: { title: 'Berita' }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
