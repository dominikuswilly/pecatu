<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Phone, Info, LayoutGrid } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Kontak', path: '/kontak', icon: Phone },
  { name: 'Layanan', path: '/layanan', icon: LayoutGrid },
  { name: 'Info', path: '/berita', icon: Info },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6 pointer-events-none">
    <div class="flex items-center justify-around w-full max-w-sm px-6 py-3 pointer-events-auto bg-white/90 backdrop-blur-lg border border-slate-200 shadow-2xl rounded-3xl">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 transition-all group"
        :class="isActive(item.path) ? 'text-pecatu scale-110' : 'text-slate-400'"
      >
        <component :is="item.icon" :size="20" :stroke-width="isActive(item.path) ? 2.5 : 2" />
        <span class="text-[10px] font-medium">{{ item.name }}</span>
        
        <!-- Active Indicator -->
        <div 
          v-if="isActive(item.path)"
          class="w-1 h-1 mt-0.5 rounded-full bg-pecatu"
        ></div>
      </router-link>
    </div>
  </nav>
</template>
