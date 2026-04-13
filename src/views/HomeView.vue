<script setup>
import { 
  ChevronRight, 
  Phone, 
  MessageSquare,
  CreditCard,
  Newspaper,
  Home as HomeIcon,
  AlertCircle,
  Zap,
  Droplets,
  Trash2,
  ShieldCheck,
  Wifi
} from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import BaseCard from '@/components/BaseCard.vue'
import { contacts, quickServices } from '@/data/contacts'

const iconMap = {
  CreditCard, Newspaper, Home: HomeIcon, AlertCircle,
  ShieldCheck, Trash2, Zap, Droplets, Wifi
}
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Header />
    
    <div class="px-6 py-6 pb-20 space-y-8">
      <!-- Hero Section -->
      <section class="space-y-2">
        <h2 class="text-3xl font-serif font-bold text-slate-800">Halo, Tetangga! 👋</h2>
        <p class="text-slate-500">Selamat datang di Portal Informasi Cluster Pecatu Residence.</p>
      </section>

      <!-- Quick Services Grid -->
      <section class="grid grid-cols-2 gap-4">
        <router-link 
          v-for="service in quickServices" 
          :key="service.id"
          :to="service.path"
          class="glass-card p-5 flex flex-col gap-3 hover:border-pecatu/30 transition-all hover:bg-pecatu/[0.02]"
        >
          <div class="w-10 h-10 rounded-xl bg-pecatu/10 text-pecatu flex items-center justify-center">
            <component :is="iconMap[service.icon]" :size="20" />
          </div>
          <span class="font-semibold text-slate-700 text-sm">{{ service.title }}</span>
        </router-link>
      </section>

      <!-- Emergency Contacts Highlights -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-serif font-bold text-xl text-slate-800">Kontak Penting</h3>
          <router-link to="/kontak" class="text-pecatu font-semibold text-sm flex items-center gap-1">
            Lihat Semua <ChevronRight :size="16" />
          </router-link>
        </div>
        
        <div class="space-y-3">
          <BaseCard 
            v-for="contact in contacts.slice(0, 3)" 
            :key="contact.id"
            :title="contact.title"
            :subtitle="contact.name"
            :icon="iconMap[contact.icon]"
            :iconColor="contact.color"
          >
            <template #action>
              <div class="flex gap-2">
                <a :href="`tel:${contact.phone}`" class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center active:scale-90 transition-all">
                  <Phone :size="18" />
                </a>
                <a :href="`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`" class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center active:scale-90 transition-all">
                  <MessageSquare :size="18" />
                </a>
              </div>
            </template>
          </BaseCard>
        </div>
      </section>
    </div>
  </div>
</template>
