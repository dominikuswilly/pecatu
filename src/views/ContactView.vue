<script setup>
import { 
  ArrowLeft,
  Phone, 
  MessageSquare,
  ShieldCheck, 
  Trash2, 
  Zap, 
  Droplets, 
  Wifi
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/BaseCard.vue'
import { contacts } from '@/data/contacts'

const router = useRouter()

const iconMap = {
  ShieldCheck, Trash2, Zap, Droplets, Wifi
}
</script>

<template>
  <div class="h-full bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-slate-100">
      <button 
        @click="router.back()" 
        class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all"
      >
        <ArrowLeft :size="20" />
      </button>
      <h1 class="text-xl font-serif font-bold text-slate-800">Kontak Pengurus</h1>
    </div>

    <div class="px-6 py-6 pb-28 space-y-6">
      <p class="text-slate-500 text-sm italic">Klik tombol WhatsApp atau Telepon untuk menghubungi petugas terkait secara langsung.</p>

      <div class="space-y-4">
        <BaseCard 
          v-for="contact in contacts" 
          :key="contact.id"
          :title="contact.title"
          :subtitle="contact.name"
          :icon="iconMap[contact.icon]"
          :iconColor="contact.color"
          padding="p-5"
        >
          <div class="px-5 pb-5">
            <p class="text-xs text-slate-400 mb-4">{{ contact.description }}</p>
            <div class="grid grid-cols-2 gap-3">
              <a 
                :href="`tel:${contact.phone}`"
                class="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm active:scale-95 transition-all"
              >
                <Phone :size="16" /> Hubungi
              </a>
              <a 
                :href="`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`"
                class="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm active:scale-95 transition-all shadow-md shadow-emerald-500/20"
              >
                <MessageSquare :size="16" /> WhatsApp
              </a>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Info Footer -->
      <div class="p-6 rounded-2xl bg-pecatu/5 border border-pecatu/10">
        <h4 class="font-bold text-pecatu mb-2">Punya Pertanyaan Lain?</h4>
        <p class="text-sm text-slate-600 leading-relaxed">Jika ada masalah yang tidak terwakili di sini, silakan hubungi pengurus RT/RW setempat.</p>
      </div>
    </div>
  </div>
</template>
