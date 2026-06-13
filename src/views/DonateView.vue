<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Wallet,
  ArrowLeft,
  History,
  Gift,
  User,
  MapPin
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const donationData = ref({
  amount_total: 0,
  detail: []
})
const error = ref(null)

const donateId = route.params.id || '2026061301'

onMounted(async () => {
  try {
    const response = await fetch(`https://api.pecatu.web.id/public/donate/${donateId}`)
    const json = await response.json()
    if (json.status === 'success') {
      donationData.value = json.data
    } else {
      error.value = 'Failed to load data'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const sortedDetails = computed(() => {
  return [...donationData.value.detail].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-32 animate-in fade-in duration-500">
    <main class="px-6 py-4 space-y-8">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-slate-100 -mx-6 -mt-4">
        <button @click="router.back()" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all">
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-xl font-serif font-bold text-slate-800">Donasi Fasilitas Cluster</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="absolute inset-0 z-10 bg-slate-50 flex justify-center items-center">
        <div class="w-8 h-8 border-4 border-pecatu border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-rose-50 text-rose-500 p-4 rounded-2xl border border-rose-100 text-center text-sm font-semibold">
        {{ error }}
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Total Card -->
        <section class="relative overflow-hidden bg-pecatu rounded-[2rem] p-6 text-white shadow-2xl shadow-pecatu/20">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-pecatu-light/30 rounded-full blur-2xl"></div>

          <div class="relative space-y-6">
            <div class="flex justify-between items-start">
              <div class="space-y-1">
                <p class="text-white/70 text-xs font-medium uppercase tracking-widest">Total Terkumpul</p>
                <h3 class="text-4xl font-bold tracking-tight">{{ formatCurrency(donationData.amount_total) }}</h3>
              </div>
              <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Wallet :size="24" />
              </div>
            </div>

            <div class="pt-4 border-t border-white/10 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <User :size="14" />
                </div>
                <div>
                  <p class="text-[10px] text-white/60 uppercase font-semibold">Donatur</p>
                  <p class="text-sm font-medium">{{ donationData.detail.length }} Orang</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Donators List -->
        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="font-serif font-bold text-xl text-slate-800">Daftar Donatur</h3>
            <span class="text-xs font-semibold text-pecatu bg-pecatu/5 px-3 py-1 rounded-full">
              {{ donationData.detail.length }} Data
            </span>
          </div>

          <div class="space-y-3">
            <div v-if="donationData.detail.length === 0" class="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <History :size="32" />
              </div>
              <div>
                <p class="text-slate-600 font-bold">Belum ada donasi</p>
              </div>
            </div>

            <div v-else v-for="item in sortedDetails" :key="item.id" class="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-pecatu/20 transition-all active:scale-[0.98]">
              <!-- Icon -->
              <div class="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-emerald-500 bg-emerald-50">
                <Gift :size="22" />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-0.5">
                  <span class="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                    {{ formatDate(item.created_at) }}
                  </span>
                  <span class="font-bold text-sm text-emerald-600">
                    + {{ formatCurrency(item.amount) }}
                  </span>
                </div>
                <p class="text-sm font-semibold text-slate-700 truncate leading-tight group-hover:text-pecatu transition-colors">
                  {{ item.name }}
                </p>
                <p class="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                  <MapPin :size="10" /> {{ item.cluster }} Blok {{ item.block }} No. {{ item.number }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
