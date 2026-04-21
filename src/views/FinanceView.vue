<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronLeft,
  Calendar,
  History,
  TrendingDown,
  TrendingUp,
  MinusCircle,
  PlusCircle,
  ChevronRight,
  Loader2
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { financialReports } from '@/data/finance'
import Header from '@/components/Header.vue'

const router = useRouter()
const selectedIndex = ref(0)
const activeTooltipIndex = ref(null)

const currentReport = computed(() => financialReports[selectedIndex.value])

const toggleTooltip = (index) => {
  if (activeTooltipIndex.value === index) {
    activeTooltipIndex.value = null
  } else {
    activeTooltipIndex.value = index
  }
}

// Close tooltip when clicking elsewhere
onMounted(() => {
  const handleClickAway = (e) => {
    if (!e.target.closest('.transaction-item')) {
      activeTooltipIndex.value = null
    }
  }
  window.addEventListener('click', handleClickAway)
  onUnmounted(() => window.removeEventListener('click', handleClickAway))
})

// Indonesian month mapping for date parsing
const indonesianMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const parseIndonesianDate = (dateStr) => {
  const [day, monthStr, year] = dateStr.split('-')
  const month = indonesianMonths.indexOf(monthStr)
  return new Date(year, month, day).getTime()
}

// Sort transactions by date descending
const sortedTransactions = computed(() => {
  return [...currentReport.value.transactions].sort((a, b) => {
    return parseIndonesianDate(b.date) - parseIndonesianDate(a.date)
  })
})

const latestDate = computed(() => {
  if (sortedTransactions.value.length === 0) return '-'
  return sortedTransactions.value[0].date
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const getTransactionIcon = (transaction) => {
  if (transaction.credit > 0) return PlusCircle
  return MinusCircle
}

const getTransactionColor = (transaction) => {
  if (transaction.credit > 0) return 'text-emerald-500 bg-emerald-50'
  if (transaction.debit > 0) return 'text-rose-500 bg-rose-50'
  return 'text-slate-400 bg-slate-50'
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-32 animate-in fade-in duration-500">
    <Header />
    
    <main class="px-6 py-6 space-y-8">
      <!-- Title & Month Selector -->
      <section class="space-y-6">
        <div class="flex items-center gap-4">
          <button 
            @click="router.back()"
            class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft :size="20" />
          </button>
          <div>
            <h2 class="text-2xl font-serif font-bold text-slate-800 leading-tight">Laporan Keuangan</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Cluster Pecatu Residence</p>
          </div>
        </div>

        <!-- Horizontal Month Selector -->
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-6 px-6">
          <button 
            v-for="(report, index) in financialReports" 
            :key="index"
            @click="selectedIndex = index"
            class="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border"
            :class="selectedIndex === index 
              ? 'bg-pecatu text-white border-pecatu shadow-lg shadow-pecatu/20' 
              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'"
          >
            {{ report.report_title.replace('LAPORAN KEUANGAN BULAN ', '') }}
          </button>
        </div>
      </section>

      <!-- Balance Cards -->
      <section class="grid grid-cols-1 gap-4">
        <!-- Main Card -->
        <div class="relative overflow-hidden bg-pecatu rounded-3xl p-6 text-white shadow-2xl shadow-pecatu/20 transition-all duration-500">
          <!-- Decorative shapes -->
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-pecatu-light/30 rounded-full blur-2xl"></div>
          
          <div class="relative space-y-6">
            <div class="flex justify-between items-start">
              <div class="space-y-1">
                <p class="text-white/70 text-xs font-medium uppercase tracking-widest">Saldo Akhir</p>
                <h3 class="text-4xl font-bold tracking-tight">{{ formatCurrency(currentReport.final_balance) }}</h3>
              </div>
              <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Wallet :size="24" />
              </div>
            </div>
            
            <div class="pt-4 border-t border-white/10 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <History :size="14" />
                </div>
                <div>
                  <p class="text-[10px] text-white/60 uppercase font-semibold">Saldo Awal</p>
                  <p class="text-sm font-medium">{{ formatCurrency(currentReport.starting_balance.amount) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-white/60 uppercase font-semibold">Latest Update</p>
                <div class="flex items-center justify-end gap-1.5 mt-0.5">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span class="text-xs font-bold">{{ latestDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics -->
      <section class="grid grid-cols-2 gap-4">
        <div class="glass-card p-4 space-y-2">
          <div class="flex items-center gap-2 text-emerald-600">
            <TrendingUp :size="16" />
            <span class="text-[10px] font-bold uppercase tracking-wider">Pemasukan</span>
          </div>
          <p class="text-lg font-bold text-slate-800">
            {{ formatCurrency(currentReport.transactions.reduce((acc, t) => acc + t.credit, 0)) }}
          </p>
        </div>
        <div class="glass-card p-4 space-y-2">
          <div class="flex items-center gap-2 text-rose-500">
            <TrendingDown :size="16" />
            <span class="text-[10px] font-bold uppercase tracking-wider">Pengeluaran</span>
          </div>
          <p class="text-lg font-bold text-slate-800">
            {{ formatCurrency(currentReport.transactions.reduce((acc, t) => acc + t.debit, 0)) }}
          </p>
        </div>
      </section>

      <!-- Transactions List -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-serif font-bold text-xl text-slate-800">Riwayat Transaksi</h3>
          <span class="text-xs font-semibold text-pecatu bg-pecatu/5 px-3 py-1 rounded-full">
            {{ currentReport.transactions.length }} Items
          </span>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="(transaction, index) in sortedTransactions" 
            :key="index"
            class="transaction-item relative group bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-pecatu/20 transition-all active:scale-[0.98]"
            @click.stop="toggleTooltip(index)"
          >
            <!-- Transaction Icon -->
            <div 
              class="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
              :class="getTransactionColor(transaction)"
            >
              <component :is="getTransactionIcon(transaction)" :size="22" />
            </div>
            
            <!-- Details -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-0.5">
                <span class="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                  {{ transaction.date }}
                </span>
                <span 
                  class="font-bold text-sm"
                  :class="transaction.credit > 0 ? 'text-emerald-600' : 'text-slate-700'"
                >
                  {{ transaction.credit > 0 ? '+' : '-' }} {{ formatCurrency(transaction.credit || transaction.debit) }}
                </span>
              </div>
              <p class="text-sm font-semibold text-slate-700 truncate leading-tight group-hover:text-pecatu transition-colors">
                {{ transaction.description }}
              </p>
              <p class="text-[11px] text-slate-400 font-medium">
                Balance: {{ formatCurrency(transaction.balance) }}
              </p>
            </div>

            <!-- Tooltip -->
            <div 
              v-if="activeTooltipIndex === index"
              class="absolute left-4 right-4 bottom-full mb-2 z-50 p-4 bg-slate-800 text-white text-xs font-medium rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div class="relative">
                <p class="leading-relaxed">{{ transaction.description }}</p>
                <!-- Arrow -->
                <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rotate-45 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Report Info -->
      <section class="p-6 bg-slate-100 rounded-3xl text-center space-y-2">
        <p class="text-xs text-slate-400 font-medium leading-relaxed">
          Semua data transaksi di atas adalah sah dan telah dilaporkan oleh pengurus Cluster Pecatu Residence.
        </p>
        <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-2">
          Authorized by Pecatu Finance
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.glass-card {
  @apply bg-white/70 backdrop-blur-md border border-white shadow-xl shadow-slate-200/50 rounded-2xl;
}
</style>
