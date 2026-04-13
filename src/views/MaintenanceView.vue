<script setup>
import { ArrowLeft, Rocket } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => route.meta.title || 'Fitur Baru')
</script>

<template>
  <div class="h-full bg-slate-50 min-h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-white px-6 py-4 flex items-center gap-4 border-b border-slate-100">
      <button 
        @click="router.back()" 
        class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all"
      >
        <ArrowLeft :size="20" />
      </button>
      <h1 class="text-xl font-serif font-bold text-slate-800">{{ pageTitle }}</h1>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-6">
      <div class="relative">
        <div class="w-32 h-32 bg-pecatu/10 rounded-full flex items-center justify-center text-pecatu animate-pulse">
          <Rocket :size="64" />
        </div>
        <div class="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center">
          <span class="text-[10px] font-bold text-white">SOON</span>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-slate-800">Tahap Pengembangan</h2>
        <p class="text-slate-500 leading-relaxed">
          Kami sedang bekerja keras untuk menghadirkan fitur <strong>{{ pageTitle }}</strong> ini. Pantau terus untuk pembaruan selanjutnya!
        </p>
      </div>

      <button 
        @click="router.push('/')"
        class="btn-primary w-full max-w-[200px]"
      >
        Kembali ke Beranda
      </button>
    </div>

    <!-- Background Decoration -->
    <div class="h-1/3 bg-gradient-to-t from-pecatu/[0.03] to-transparent pointer-events-none"></div>
  </div>
</template>
