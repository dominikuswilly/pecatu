<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Wallet,
  ArrowLeft,
  Search,
  Filter,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronRight,
  X,
  FileSpreadsheet,
  Building2,
  KeyRound,
  AlertCircle
} from 'lucide-vue-next'

const router = useRouter()

// Reactive States
const isLoading = ref(true)
const isRefreshing = ref(false)
const error = ref(null)
const data = ref(null)
const dataSource = ref('Memuat...')

// Filters & Controls
const searchQuery = ref('')
const selectedCluster = ref('ALL')
const selectedStatus = ref('ALL') // ALL, PAID, UNPAID, HAS_CARD
const selectedYear = ref('ALL') // ALL, 2026, 2027, 2028
const activeTab = ref('cards') // 'cards' | 'table'

// URL input modal
const showUrlModal = ref(false)
const customUrl = ref('')

// Detail modal
const selectedResident = ref(null)

// API Fetcher
const fetchContributionData = async (urlOverride = '') => {
  isRefreshing.value = true
  error.value = null

  // Candidate API endpoints
  const apiBase = import.meta.env.VITE_API_URL || 'https://api.pecatu.web.id'
  const endpoints = [
    urlOverride 
      ? `${apiBase}/public/contribution-fee?url=${encodeURIComponent(urlOverride)}` 
      : `${apiBase}/public/contribution-fee`,
    urlOverride 
      ? `http://localhost:6201/public/contribution-fee?url=${encodeURIComponent(urlOverride)}` 
      : `http://localhost:6201/public/contribution-fee`
  ]

  let succeeded = false

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { cache: 'no-cache' })
      if (!res.ok) continue
      const json = await res.json()
      if (json.status === 'success' && json.data) {
        data.value = json.data
        dataSource.value = json.data.source || (endpoint.includes('localhost') ? 'Local Backend API (:6201)' : 'Cloud Backend API')
        succeeded = true
        break
      }
    } catch (err) {
      // Continue to next endpoint or fallback
    }
  }

  if (!succeeded) {
    if (!data.value || !data.value.residents) {
      try {
        const fallbackModule = await import('@/data/contributionFeeFallback')
        data.value = fallbackModule.fallbackContributionFeeData
        dataSource.value = 'Local Data Snapshot'
      } catch (err) {
        error.value = 'Gagal memuat data iuran warga'
      }
    }
  }

  isLoading.value = false
  isRefreshing.value = false
}

onMounted(() => {
  fetchContributionData()
})

// Utilities
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

// Available unique clusters
const availableClusters = computed(() => {
  if (!data.value?.residents) return []
  const clusters = data.value.residents
    .map(r => r.cluster?.trim())
    .filter(Boolean)
  return ['ALL', ...new Set(clusters)].sort((a, b) => {
    if (a === 'ALL') return -1
    if (b === 'ALL') return 1
    return a.localeCompare(b)
  })
})

// Available unique years from periods
const availableYears = computed(() => {
  if (!data.value?.periods) return ['ALL']
  const years = data.value.periods.map(p => p.year)
  return ['ALL', ...new Set(years)]
})

// Filtered Periods according to selectedYear
const filteredPeriods = computed(() => {
  if (!data.value?.periods) return []
  if (selectedYear.value === 'ALL') return data.value.periods
  return data.value.periods.filter(p => p.year === Number(selectedYear.value))
})

// Filtered Residents List
const filteredResidents = computed(() => {
  if (!data.value?.residents) return []
  const query = searchQuery.value.trim().toLowerCase()

  return data.value.residents.filter(r => {
    // Search query match
    if (query) {
      const matchName = r.name?.toLowerCase().includes(query)
      const matchCluster = r.cluster?.toLowerCase().includes(query)
      const matchBlock = r.block?.toLowerCase().includes(query)
      const matchNumber = r.number?.toLowerCase().includes(query)
      const matchCard1 = r.card_number_1?.toLowerCase().includes(query)
      const matchCard2 = r.card_number_2?.toLowerCase().includes(query)
      const matchNotes = r.notes?.toLowerCase().includes(query)
      if (!matchName && !matchCluster && !matchBlock && !matchNumber && !matchCard1 && !matchCard2 && !matchNotes) {
        return false
      }
    }

    // Cluster filter
    if (selectedCluster.value !== 'ALL') {
      if (r.cluster?.trim() !== selectedCluster.value) return false
    }

    // Status filter
    if (selectedStatus.value === 'PAID' && r.total_paid <= 0) return false
    if (selectedStatus.value === 'UNPAID' && r.total_paid > 0) return false
    if (selectedStatus.value === 'HAS_CARD' && !r.has_access_card) return false
    if (selectedStatus.value === 'HAS_EXTRA_CARD' && !r.has_additional_card) return false

    return true
  })
})

// Selected Resident Detailed Payment Breakdown by Year
const residentPaymentsByYear = computed(() => {
  if (!selectedResident.value?.payments) return {}
  const groups = {}
  for (const pay of selectedResident.value.payments) {
    if (!groups[pay.year]) groups[pay.year] = []
    groups[pay.year].push(pay)
  }
  return groups
})

// Clear all filters
const resetFilters = () => {
  searchQuery.value = ''
  selectedCluster.value = 'ALL'
  selectedStatus.value = 'ALL'
  selectedYear.value = 'ALL'
}

// Handle Custom URL Submit
const handleCustomUrlSubmit = () => {
  if (customUrl.value.trim()) {
    fetchContributionData(customUrl.value.trim())
    showUrlModal.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 pb-28 animate-in fade-in duration-300">
    
    <!-- Top Sticky Header -->
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <button 
            @click="router.back()" 
            class="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            title="Kembali"
          >
            <ArrowLeft :size="18" />
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg sm:text-xl font-serif font-bold text-slate-900 leading-tight">
                Iuran Kas & Kartu Akses
              </h1>
              <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles :size="12" /> Cluster Pecatu
              </span>
            </div>
            <p class="text-xs text-slate-500">Transparansi Pembayaran Iuran & Pendataan Kartu Akses Warga</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Refresh Button -->
          <button 
            @click="fetchContributionData()" 
            :disabled="isRefreshing"
            class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            title="Perbarui Data"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
          </button>

          <!-- Custom URL Trigger -->
          <button 
            @click="showUrlModal = true"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pecatu/30 bg-pecatu/5 text-pecatu text-xs font-semibold hover:bg-pecatu/10 active:scale-95 transition-all"
          >
            <FileSpreadsheet :size="14" />
            <span class="hidden sm:inline">Sumber Data CSV</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      <!-- Loading State -->
      <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center gap-3">
        <div class="w-10 h-10 border-4 border-pecatu border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-slate-500">Memuat data iuran warga dari backend service...</p>
      </div>

      <!-- Loaded Content -->
      <template v-else>

        <!-- Stats Overview Cards Grid -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 1: Total Kas Terkumpul -->
          <div class="relative overflow-hidden bg-gradient-to-br from-pecatu via-pecatu to-pecatu-dark rounded-2xl p-5 text-white shadow-lg shadow-pecatu/20">
            <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase font-medium tracking-wider text-white/80">Total Kas Terkumpul</span>
              <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Wallet :size="18" />
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl sm:text-3xl font-bold tracking-tight">
                {{ formatCurrency(data.summary?.total_collected) }}
              </div>
              <p class="text-xs text-white/70 mt-1">Akumulasi iuran tercatat seluruh cluster</p>
            </div>
          </div>

          <!-- Card 2: Total Warga -->
          <div class="glass-card p-5 border border-slate-200/80 bg-white">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Warga Terdata</span>
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users :size="18" />
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl sm:text-3xl font-bold text-slate-800">
                {{ data.summary?.total_residents || 0 }}
                <span class="text-sm font-normal text-slate-500">Hunian/KK</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">Cluster Akasha, Amartha & Ayodya</p>
            </div>
          </div>

          <!-- Card 3: Kartu Akses -->
          <div class="glass-card p-5 border border-slate-200/80 bg-white">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase font-semibold text-slate-400 tracking-wider">Kartu Akses</span>
              <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound :size="18" />
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl sm:text-3xl font-bold text-slate-800">
                {{ data.summary?.total_access_cards || 0 }}
                <span class="text-sm font-normal text-slate-500">Aktif</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-1">
                <span>+{{ data.summary?.total_extra_cards || 0 }} kartu tambahan</span>
              </div>
            </div>
          </div>

          <!-- Card 4: Periode Tercatat -->
          <div class="glass-card p-5 border border-slate-200/80 bg-white">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase font-semibold text-slate-400 tracking-wider">Cakupan Periode</span>
              <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar :size="18" />
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl sm:text-3xl font-bold text-slate-800">
                {{ data.periods?.length || 0 }}
                <span class="text-sm font-normal text-slate-500">Bulan</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                {{ data.periods?.[0]?.month }} {{ data.periods?.[0]?.year }} - {{ data.periods?.[data.periods.length - 1]?.month }} {{ data.periods?.[data.periods.length - 1]?.year }}
              </p>
            </div>
          </div>

        </section>

        <!-- Cluster Highlights Row -->
        <section v-if="data.summary?.cluster_summaries?.length" class="space-y-3">
          <h2 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Building2 :size="16" class="text-pecatu" /> Rangkuman Berdasarkan Cluster
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              v-for="cluster in data.summary.cluster_summaries.filter(c => c.name !== 'Lainnya')" 
              :key="cluster.name"
              class="glass-card p-4 bg-white border border-slate-200/80 hover:border-pecatu/40 transition-all cursor-pointer"
              :class="{ 'ring-2 ring-pecatu': selectedCluster === cluster.name }"
              @click="selectedCluster = (selectedCluster === cluster.name ? 'ALL' : cluster.name)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif font-bold text-base text-slate-800">{{ cluster.name }}</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {{ cluster.total_residents }} Hunian
                </span>
              </div>
              <div class="flex items-baseline justify-between text-sm">
                <span class="text-slate-500 text-xs">Terkumpul:</span>
                <span class="font-bold text-pecatu">{{ formatCurrency(cluster.total_paid_amount) }}</span>
              </div>
              <div class="flex items-baseline justify-between text-xs mt-1 text-slate-500">
                <span>Kartu Akses:</span>
                <span class="font-medium text-slate-700">{{ cluster.total_access_cards }} Warga</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Search, Filters, and View Switcher -->
        <section class="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            <!-- Search Bar -->
            <div class="relative flex-1">
              <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Cari nama warga, blok (misal: O53), nomor rumah, atau nomor kartu..."
                class="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pecatu/20 focus:border-pecatu transition-all"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X :size="14" />
              </button>
            </div>

            <!-- View Switcher -->
            <div class="flex items-center bg-slate-100 p-1 rounded-xl self-end md:self-auto">
              <button 
                @click="activeTab = 'cards'"
                :class="activeTab === 'cards' ? 'bg-white text-pecatu font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                class="px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5"
              >
                <Layers :size="14" /> Kartu Warga
              </button>
              <button 
                @click="activeTab = 'table'"
                :class="activeTab === 'table' ? 'bg-white text-pecatu font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                class="px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet :size="14" /> Matrix Iuran
              </button>
            </div>

          </div>

          <!-- Secondary Filters Row -->
          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            
            <!-- Cluster Filter -->
            <div class="flex items-center gap-1">
              <span class="text-slate-400 font-medium">Cluster:</span>
              <select 
                v-model="selectedCluster"
                class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-pecatu"
              >
                <option value="ALL">Semua Cluster</option>
                <option v-for="c in availableClusters.filter(c => c !== 'ALL')" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div class="flex items-center gap-1">
              <span class="text-slate-400 font-medium">Status:</span>
              <select 
                v-model="selectedStatus"
                class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-pecatu"
              >
                <option value="ALL">Semua Status</option>
                <option value="PAID">Sudah Ada Pembayaran</option>
                <option value="UNPAID">Belum Membayar</option>
                <option value="HAS_CARD">Punya Kartu Akses</option>
                <option value="HAS_EXTRA_CARD">Tambah Kartu (+25rb)</option>
              </select>
            </div>

            <!-- Year Filter -->
            <div class="flex items-center gap-1">
              <span class="text-slate-400 font-medium">Tahun:</span>
              <select 
                v-model="selectedYear"
                class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-pecatu"
              >
                <option value="ALL">Semua Tahun</option>
                <option v-for="y in availableYears.filter(y => y !== 'ALL')" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>

            <!-- Reset Filter Button -->
            <button 
              v-if="searchQuery || selectedCluster !== 'ALL' || selectedStatus !== 'ALL' || selectedYear !== 'ALL'"
              @click="resetFilters"
              class="text-xs text-rose-600 hover:text-rose-700 font-medium ml-auto flex items-center gap-1"
            >
              <X :size="12" /> Reset Filter
            </button>

            <!-- Results Counter -->
            <div class="text-slate-400 text-xs ml-auto">
              Menampilkan <span class="font-bold text-slate-700">{{ filteredResidents.length }}</span> dari {{ data.residents?.length || 0 }} warga
            </div>

          </div>
        </section>

        <!-- TAB 1: Resident Cards Grid -->
        <section v-if="activeTab === 'cards'" class="space-y-4">
          
          <!-- Empty State -->
          <div v-if="filteredResidents.length === 0" class="glass-card py-16 text-center space-y-3 bg-white">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search :size="24" />
            </div>
            <h3 class="font-serif font-bold text-slate-700">Warga tidak ditemukan</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan kriteria pencarian atau filter yang dipilih.
            </p>
            <button @click="resetFilters" class="btn-primary text-xs py-1.5 px-3">
              Reset Semua Filter
            </button>
          </div>

          <!-- Cards Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="resident in filteredResidents" 
              :key="resident.no + resident.name"
              class="glass-card bg-white p-4 border border-slate-200/80 hover:border-pecatu/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <!-- Top Row: Cluster badge & Block number -->
                <div class="flex items-center justify-between mb-2">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-pecatu/10 text-pecatu">
                    {{ resident.cluster || 'Cluster Pecatu' }}
                  </span>
                  <span class="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {{ resident.block ? resident.block : '' }}{{ resident.number ? ' - ' + resident.number : '' }}
                  </span>
                </div>

                <!-- Resident Name -->
                <h3 class="font-serif font-bold text-base text-slate-900 line-clamp-1 group-hover:text-pecatu transition-colors">
                  {{ resident.name }}
                </h3>

                <!-- Access Card Status Badges -->
                <div class="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span 
                    v-if="resident.has_access_card"
                    class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <KeyRound :size="10" /> Kartu #{{ resident.card_number_1 || 'OK' }}
                  </span>
                  <span 
                    v-if="resident.has_additional_card"
                    class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    +1 Tambahan {{ resident.card_number_2 ? `(#${resident.card_number_2})` : '' }}
                  </span>
                  <span 
                    v-if="!resident.has_access_card"
                    class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500"
                  >
                    Belum Ada Kartu
                  </span>
                </div>

                <!-- Notes Snippet if available -->
                <div v-if="resident.notes" class="mt-2 text-[11px] text-amber-700 bg-amber-50/70 p-2 rounded-lg border border-amber-200/50 flex items-start gap-1.5">
                  <Info :size="12" class="mt-0.5 shrink-0" />
                  <span class="line-clamp-2">{{ resident.notes }}</span>
                </div>

                <!-- Recent Payments Pills Mini Timeline -->
                <div class="mt-3 pt-3 border-t border-slate-100">
                  <div class="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Bulan Terbayar:</span>
                    <span class="font-bold text-slate-700">{{ resident.months_paid_count }} Bulan</span>
                  </div>
                  <div class="flex flex-wrap gap-1 max-h-14 overflow-hidden">
                    <span 
                      v-for="p in resident.payments.filter(p => p.paid).slice(0, 6)" 
                      :key="p.period"
                      class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-100"
                    >
                      {{ p.month.slice(0, 3) }} '{{ String(p.year).slice(2) }}
                    </span>
                    <span 
                      v-if="resident.months_paid_count > 6"
                      class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold"
                    >
                      +{{ resident.months_paid_count - 6 }} bln
                    </span>
                    <span 
                      v-if="resident.months_paid_count === 0"
                      class="text-[10px] text-slate-400 italic"
                    >
                      Belum tercatat pembayaran
                    </span>
                  </div>
                </div>
              </div>

              <!-- Card Footer: Total Paid and Detail Action -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] uppercase text-slate-400 font-semibold">Total Iuran</span>
                  <div class="text-sm font-bold text-pecatu">
                    {{ formatCurrency(resident.total_paid) }}
                  </div>
                </div>
                <button 
                  @click="selectedResident = resident"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-pecatu bg-pecatu/10 hover:bg-pecatu hover:text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                >
                  Detail <ChevronRight :size="14" />
                </button>
              </div>

            </div>
          </div>

        </section>

        <!-- TAB 2: Full Monthly Matrix Table View -->
        <section v-if="activeTab === 'table'" class="space-y-4">
          <div class="glass-card bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div class="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1.5">
                <Info :size="14" /> Geser tabel ke kanan untuk melihat rincian pembayaran seluruh bulan
              </span>
              <span class="font-medium text-slate-600">
                Kolom periode: {{ filteredPeriods.length }} bulan
              </span>
            </div>

            <div class="overflow-x-auto max-h-[650px] relative">
              <table class="w-full text-left text-xs border-collapse">
                <!-- Table Head -->
                <thead class="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-20 shadow-sm">
                  <tr>
                    <th class="p-3 sticky left-0 z-30 bg-slate-100 border-r border-slate-200 w-12 text-center">No</th>
                    <th class="p-3 sticky left-12 z-30 bg-slate-100 border-r border-slate-200 min-w-[160px]">Nama Warga</th>
                    <th class="p-3 min-w-[100px] border-r border-slate-200">Cluster</th>
                    <th class="p-3 min-w-[80px] border-r border-slate-200">Blok / No</th>
                    <th class="p-3 min-w-[80px] border-r border-slate-200 text-center">Kartu</th>
                    <th class="p-3 min-w-[100px] border-r border-slate-200 text-right">Total Bayar</th>
                    <!-- Dynamic Month Columns -->
                    <th 
                      v-for="p in filteredPeriods" 
                      :key="p.key"
                      class="p-2.5 min-w-[80px] border-r border-slate-200 text-center whitespace-nowrap"
                    >
                      <span class="block text-[11px] font-bold text-slate-800">{{ p.month.slice(0, 3) }}</span>
                      <span class="block text-[10px] text-slate-500 font-normal">{{ p.year }}</span>
                    </th>
                  </tr>
                </thead>

                <!-- Table Body -->
                <tbody class="divide-y divide-slate-100">
                  <tr 
                    v-for="(resident, idx) in filteredResidents" 
                    :key="resident.no + resident.name"
                    class="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    @click="selectedResident = resident"
                  >
                    <td class="p-3 text-center sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-slate-400 font-mono">
                      {{ resident.no || idx + 1 }}
                    </td>
                    <td class="p-3 font-semibold text-slate-900 sticky left-12 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200 whitespace-nowrap">
                      {{ resident.name }}
                      <span v-if="resident.notes" class="ml-1 text-amber-500 font-normal" :title="resident.notes">*</span>
                    </td>
                    <td class="p-3 border-r border-slate-200 text-slate-600 whitespace-nowrap">
                      {{ resident.cluster }}
                    </td>
                    <td class="p-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">
                      {{ resident.block }}-{{ resident.number }}
                    </td>
                    <td class="p-3 border-r border-slate-200 text-center whitespace-nowrap">
                      <span 
                        v-if="resident.has_access_card" 
                        class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800"
                        :title="`Nomor kartu: ${resident.card_number_1 || '-'}`"
                      >
                        ✓
                      </span>
                      <span v-else class="text-slate-300">-</span>
                    </td>
                    <td class="p-3 border-r border-slate-200 text-right font-bold text-pecatu whitespace-nowrap">
                      {{ formatCurrency(resident.total_paid) }}
                    </td>

                    <!-- Dynamic Month Cell -->
                    <td 
                      v-for="p in filteredPeriods" 
                      :key="p.key"
                      class="p-2 border-r border-slate-200 text-center whitespace-nowrap"
                    >
                      <template v-for="pay in resident.payments" :key="pay.period">
                        <span 
                          v-if="pay.year === p.year && pay.month.toLowerCase() === p.month.toLowerCase()"
                          :class="pay.paid ? 'bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded border border-emerald-200' : 'text-slate-300'"
                          class="inline-block text-[11px]"
                        >
                          {{ pay.paid ? '15k' : '-' }}
                        </span>
                      </template>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </template>

    </main>

    <!-- RESIDENT DETAIL MODAL / DRAWER -->
    <div 
      v-if="selectedResident" 
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="selectedResident = null"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col">
        
        <!-- Modal Header -->
        <div class="p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10 flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-pecatu/10 text-pecatu">
                {{ selectedResident.cluster || 'Cluster Pecatu' }}
              </span>
              <span class="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                Blok {{ selectedResident.block || '-' }} / No {{ selectedResident.number || '-' }}
              </span>
            </div>
            <h2 class="text-xl font-serif font-bold text-slate-900 leading-tight">
              {{ selectedResident.name }}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Nomor Urut: #{{ selectedResident.no }}</p>
          </div>
          <button 
            @click="selectedResident = null" 
            class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="p-6 space-y-6">

          <!-- Access Card Info Card -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <KeyRound :size="14" class="text-pecatu" /> Informasi Kartu Akses
            </h4>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-slate-400 block">Status Kartu Utama:</span>
                <span class="font-semibold text-slate-800">
                  {{ selectedResident.has_access_card ? 'Aktif' : 'Tidak Ada' }}
                </span>
                <span v-if="selectedResident.card_number_1" class="text-slate-500 block text-[11px]">
                  No: #{{ selectedResident.card_number_1 }}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block">Kartu Tambahan:</span>
                <span class="font-semibold text-slate-800">
                  {{ selectedResident.has_additional_card ? 'Ya (+Rp 25.000)' : 'Tidak' }}
                </span>
                <span v-if="selectedResident.card_number_2" class="text-slate-500 block text-[11px]">
                  No: #{{ selectedResident.card_number_2 }}
                </span>
              </div>
              <div v-if="selectedResident.card_expired" class="col-span-2 pt-2 border-t border-slate-200/60">
                <span class="text-slate-400 block">Masa Berlaku Kartu:</span>
                <span class="font-semibold text-amber-700">{{ selectedResident.card_expired }}</span>
              </div>
            </div>
          </div>

          <!-- Notes If Any -->
          <div v-if="selectedResident.notes" class="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs space-y-1">
            <div class="font-semibold text-amber-800 flex items-center gap-1.5">
              <AlertCircle :size="14" /> Catatan Khusus
            </div>
            <p class="text-amber-700 leading-relaxed">{{ selectedResident.notes }}</p>
          </div>

          <!-- Total Contribution Highlight -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-pecatu/10 to-pecatu-light/10 border border-pecatu/20">
            <div>
              <span class="text-xs text-slate-500">Total Telah Dibayar</span>
              <div class="text-xl font-bold text-pecatu">{{ formatCurrency(selectedResident.total_paid) }}</div>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500">Jumlah Bulan</span>
              <div class="text-base font-bold text-slate-800">{{ selectedResident.months_paid_count }} Bulan</div>
            </div>
          </div>

          <!-- Month-by-Month Breakdown Grouped by Year -->
          <div class="space-y-4">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar :size="14" class="text-pecatu" /> Rincian Pembayaran Bulanan
            </h4>

            <div v-for="(payments, yr) in residentPaymentsByYear" :key="yr" class="space-y-2">
              <div class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg flex items-center justify-between">
                <span>Tahun {{ yr }}</span>
                <span class="font-normal text-slate-500">
                  {{ payments.filter(p => p.paid).length }} / {{ payments.length }} Bulan
                </span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div 
                  v-for="p in payments" 
                  :key="p.period"
                  :class="p.paid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'"
                  class="p-2.5 rounded-xl border text-xs flex flex-col justify-between"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">{{ p.month }}</span>
                    <CheckCircle2 v-if="p.paid" :size="14" class="text-emerald-600" />
                    <XCircle v-else :size="14" class="text-slate-300" />
                  </div>
                  <span class="mt-1 text-[11px] font-mono">
                    {{ p.paid ? formatCurrency(p.amount) : 'Belum Bayar' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50 text-right">
          <button 
            @click="selectedResident = null"
            class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>

    <!-- CUSTOM URL MODAL -->
    <div 
      v-if="showUrlModal" 
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="showUrlModal = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between">
          <h3 class="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
            <FileSpreadsheet :size="18" class="text-pecatu" /> Hubungkan URL File CSV
          </h3>
          <button @click="showUrlModal = false" class="text-slate-400 hover:text-slate-700">
            <X :size="18" />
          </button>
        </div>

        <p class="text-xs text-slate-500 leading-relaxed">
          Masukkan URL file CSV (misalnya tautan Google Sheets yang dipublikasikan sebagai CSV) untuk diproses secara langsung oleh Backend service.
        </p>

        <div class="space-y-2">
          <label class="text-xs font-semibold text-slate-700">URL File CSV:</label>
          <input 
            v-model="customUrl"
            type="url" 
            placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pecatu focus:ring-2 focus:ring-pecatu/20"
          />
        </div>

        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div class="font-semibold text-slate-700">Sumber Aktif Saat Ini:</div>
          <div class="font-mono text-[10px] break-all text-pecatu">{{ dataSource }}</div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button 
            @click="showUrlModal = false" 
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button 
            @click="handleCustomUrlSubmit" 
            :disabled="!customUrl.trim()"
            class="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw :size="14" /> Unduh & Proses
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
