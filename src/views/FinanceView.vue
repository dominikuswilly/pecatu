<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Wallet,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Calendar,
  History,
  TrendingDown,
  TrendingUp,
  MinusCircle,
  PlusCircle,
  ChevronRight
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { financialReports } from '@/data/finance'

const router = useRouter()
const isLoading = ref(false)
const selectedYear = ref('')
const selectedReportTitle = ref('')

// Extract unique years from reports
const availableYears = computed(() => {
  const years = financialReports.map(r => r.report_title.split(' ').pop())
  return [...new Set(years)].sort((a, b) => b - a)
})

// Reports filtered by the selected year
const filteredReports = computed(() => {
  return financialReports.filter(r => r.report_title.endsWith(selectedYear.value))
})

// Current active report
const currentReport = computed(() => {
  return financialReports.find(r => r.report_title === selectedReportTitle.value) || filteredReports.value[0] || financialReports[0]
})

// Initialize values
onMounted(() => {
  selectedYear.value = availableYears.value[0]
  selectedReportTitle.value = financialReports[0].report_title
})

// Handle year change
watch(selectedYear, (newYear) => {
  const firstInYear = financialReports.find(r => r.report_title.endsWith(newYear))
  if (firstInYear) {
    selectReport(firstInYear.report_title)
  }
})

const selectReport = (title) => {
  if (selectedReportTitle.value === title) return

  isLoading.value = true
  selectedReportTitle.value = title

  // Simulate loading for premium feel
  setTimeout(() => {
    isLoading.value = false
  }, 400)
}

const activeTooltipIndex = ref(null)

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
  if (!currentReport.value) return []
  return [...currentReport.value.transactions].sort((a, b) => {
    return parseIndonesianDate(b.date) - parseIndonesianDate(a.date)
  })
})

const latestDate = computed(() => {
  if (!sortedTransactions.value || sortedTransactions.value.length === 0) return '-'
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
    <main class="px-6 py-4 space-y-8">
      <!-- Header (Aligned with ContactView) -->
      <div
        class="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-slate-100 -mx-6 -mt-4">
        <button @click="router.back()"
          class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all">
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-xl font-serif font-bold text-slate-800">Laporan Keuangan</h1>
      </div>

      <!-- Selectors Section -->
      <section
        class="sticky top-[72px] z-40 bg-slate-50/90 backdrop-blur-md px-6 -mx-6 border-b border-white space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Tahun</span>
          <!-- Year Selector -->
          <div class="relative group">
            <div
              class="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm active:scale-95 transition-all cursor-pointer">
              <Calendar :size="14" class="text-pecatu" />
              <select v-model="selectedYear"
                class="appearance-none bg-transparent text-xs font-bold text-slate-700 focus:outline-none pr-4">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <ChevronRight :size="12" class="text-slate-400 rotate-90" />
            </div>
          </div>
        </div>

        <!-- Horizontal Month Selector with Ghost Fade -->
        <div class="relative -mx-2">
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-2 snap-x">
            <button v-for="report in filteredReports" :key="report.report_title"
              @click="selectReport(report.report_title)"
              class="shrink-0 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border snap-start" :class="selectedReportTitle === report.report_title
                ? 'bg-pecatu text-white border-pecatu shadow-lg shadow-pecatu/20'
                : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'">
              {{ report.report_title.split(' ')[3] }}
            </button>
          </div>
          <!-- Edge Fades (Ghost Sliders) -->
          <div
            class="absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none">
          </div>
          <div
            class="absolute top-0 left-0 bottom-2 w-12 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none">
          </div>
        </div>
      </section>

      <!-- Balance Cards -->
      <section class="grid grid-cols-1 gap-4 relative min-h-[200px]">
        <div v-if="isLoading" class="absolute inset-0 z-10 bg-slate-50">
          <div class="w-full h-full bg-slate-100 rounded-[2rem] animate-pulse p-6 flex flex-col justify-between">
            <div class="flex justify-between">
              <div class="space-y-3">
                <div class="w-20 h-3 bg-slate-200 rounded-full"></div>
                <div class="w-48 h-10 bg-slate-200 rounded-2xl"></div>
              </div>
              <div class="w-12 h-12 bg-slate-200 rounded-2xl"></div>
            </div>
            <div class="flex justify-between pt-4 border-t border-slate-200">
              <div class="w-32 h-8 bg-slate-200 rounded-xl"></div>
              <div class="w-24 h-8 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>

        <Transition name="slide-up" mode="out-in">
          <div :key="selectedReportTitle" v-if="!isLoading && currentReport"
            class="relative overflow-hidden bg-pecatu rounded-[2rem] p-6 text-white shadow-2xl shadow-pecatu/20">
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
        </Transition>
      </section>

      <!-- Statistics -->
      <section class="grid grid-cols-2 gap-4">
        <div class="glass-card p-4 space-y-2" :class="{ 'animate-pulse bg-slate-100': isLoading }">
          <div v-if="!isLoading" class="space-y-2">
            <div class="flex items-center gap-2 text-emerald-600">
              <TrendingUp :size="16" />
              <span class="text-[10px] font-bold uppercase tracking-wider">Pemasukan</span>
            </div>
            <p class="text-lg font-bold text-slate-800">
              {{formatCurrency(currentReport.transactions.reduce((acc, t) => acc + t.credit, 0))}}
            </p>
          </div>
          <div v-else class="h-12"></div>
        </div>
        <div class="glass-card p-4 space-y-2" :class="{ 'animate-pulse bg-slate-100': isLoading }">
          <div v-if="!isLoading" class="space-y-2">
            <div class="flex items-center gap-2 text-rose-500">
              <TrendingDown :size="16" />
              <span class="text-[10px] font-bold uppercase tracking-wider">Pengeluaran</span>
            </div>
            <p class="text-lg font-bold text-slate-800">
              {{formatCurrency(currentReport.transactions.reduce((acc, t) => acc + t.debit, 0))}}
            </p>
          </div>
          <div v-else class="h-12"></div>
        </div>
      </section>

      <!-- Transactions List -->
      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="font-serif font-bold text-xl text-slate-800">Riwayat Transaksi</h3>
          <span v-if="!isLoading" class="text-xs font-semibold text-pecatu bg-pecatu/5 px-3 py-1 rounded-full">
            {{ currentReport?.transactions?.length || 0 }} Items
          </span>
          <div v-else class="w-16 h-6 bg-slate-100 rounded-full animate-pulse"></div>
        </div>

        <div class="space-y-3 relative min-h-[200px]">
          <!-- Skeleton Rows -->
          <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 5" :key="i"
              class="bg-white p-4 rounded-2xl border border-slate-50 flex items-center gap-4 animate-pulse">
              <div class="w-12 h-12 rounded-xl bg-slate-100"></div>
              <div class="flex-1 space-y-2">
                <div class="flex justify-between">
                  <div class="w-16 h-2 bg-slate-100 rounded"></div>
                  <div class="w-20 h-3 bg-slate-100 rounded"></div>
                </div>
                <div class="w-3/4 h-4 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>

          <TransitionGroup v-else name="list-complete" tag="div" class="space-y-3">
            <!-- Empty State -->
            <div v-if="sortedTransactions.length === 0" key="empty"
              class="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <History :size="32" />
              </div>
              <div>
                <p class="text-slate-600 font-bold">Belum ada transaksi</p>
                <p class="text-xs text-slate-400 mt-1">Tidak ada data transaksi yang tercatat untuk periode ini.</p>
              </div>
            </div>

            <!-- Transaction Items -->
            <div v-for="(transaction, index) in sortedTransactions" :key="transaction.description + transaction.date"
              class="transaction-item relative group bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-pecatu/20 transition-all active:scale-[0.98]"
              @click.stop="toggleTooltip(index)">
              <!-- Transaction Icon -->
              <div class="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
                :class="getTransactionColor(transaction)">
                <component :is="getTransactionIcon(transaction)" :size="22" />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-0.5">
                  <span class="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                    {{ transaction.date }}
                  </span>
                  <span class="font-bold text-sm"
                    :class="transaction.credit > 0 ? 'text-emerald-600' : 'text-slate-700'">
                    {{ transaction.credit > 0 ? '+' : '-' }} {{ formatCurrency(transaction.credit || transaction.debit)
                    }}
                  </span>
                </div>
                <p
                  class="text-sm font-semibold text-slate-700 truncate leading-tight group-hover:text-pecatu transition-colors">
                  {{ transaction.description }}
                </p>
                <p class="text-[11px] text-slate-400 font-medium">
                  Balance: {{ formatCurrency(transaction.balance) }}
                </p>
              </div>

              <!-- Tooltip -->
              <div v-if="activeTooltipIndex === index"
                class="absolute left-4 right-4 bottom-full mb-2 z-50 p-4 bg-slate-800 text-white text-xs font-medium rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div class="relative">
                  <p class="leading-relaxed">{{ transaction.description }}</p>
                  <!-- Arrow -->
                  <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rotate-45 rounded-sm">
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </section>

      <!-- Report Info -->
      <section class="p-8 bg-slate-100 rounded-[2.5rem] text-center space-y-3">
        <p class="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
          Semua data transaksi di atas adalah sah dan telah dilaporkan oleh pengurus Cluster Pecatu Residence.
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2">
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

.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Slide Up Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.02);
}

/* List Transitions */
.list-complete-enter-active,
.list-complete-leave-active {
  transition: all 0.4s ease;
}

.list-complete-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-complete-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}

/* Hover effects */
.transaction-item {
  @apply transition-all duration-300;
}

.transaction-item:hover {
  @apply shadow-lg shadow-slate-200/50 -translate-y-0.5;
}
</style>
