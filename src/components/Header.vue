<script setup>
import { Bell } from 'lucide-vue-next'
</script>

<template>
  <header
    class="fixed top-0 z-50 w-full max-w-md bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100">
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 bg-pecatu rounded-xl flex items-center justify-center text-white shadow-lg shadow-pecatu/30">
        <span class="font-serif text-xl font-bold italic">P</span>
      </div>
      <div>
        <h1 class="text-lg font-serif font-bold text-pecatu leading-tight tracking-tight">Pecatu <span
            class="font-sans text-xs font-normal text-slate-400 block -mt-1">Residence</span></h1>
      </div>
    </div>
    <button
      class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-pecatu hover:border-pecatu transition-colors relative">
      <Bell :size="18" />
      <span class="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"></span>
    </button>
  </header>
</template>
