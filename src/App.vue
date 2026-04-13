<script setup>
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <div class="min-h-screen pb-24 bg-slate-50">
    <!-- Main Content Container (Mobile Optimized) -->
    <main class="max-w-md mx-auto min-h-screen shadow-xl bg-white overflow-hidden relative">
      <RouterView v-slot="{ Component }">
        <transition 
          name="fade" 
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Navigation -->
    <BottomNav />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Hide Scrollbar */
::-webkit-scrollbar {
  display: none;
}
</style>
