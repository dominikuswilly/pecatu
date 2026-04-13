<script setup>
defineProps({
  title: String,
  subtitle: String,
  icon: Object,
  iconColor: {
    type: String,
    default: 'bg-pecatu/10 text-pecatu'
  },
  padding: {
    type: String,
    default: 'p-4'
  }
})
</script>

<template>
  <div class="glass-card transition-all active:scale-[0.98] group">
    <div :class="[padding, 'flex items-center gap-4']">
      <div v-if="icon" :class="[iconColor, 'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6']">
        <component :is="icon" :size="24" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 v-if="title" class="text-slate-900 font-semibold truncate">{{ title }}</h3>
        <p v-if="subtitle" class="text-slate-500 text-sm truncate">{{ subtitle }}</p>
      </div>
      <slot name="action"></slot>
    </div>
    <slot></slot>
  </div>
</template>
