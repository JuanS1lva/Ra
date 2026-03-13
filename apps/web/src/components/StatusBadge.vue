<script setup lang="ts">
defineProps<{ status: string }>()

const map: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  TRIAL: 'bg-blue-100 text-blue-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  SUSPENDED: 'bg-red-100 text-red-700',
  CANCELED: 'bg-red-100 text-red-700',
  DISABLED: 'bg-slate-100 text-slate-500',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="map[status] ?? 'bg-slate-100 text-slate-600'"
  >
    {{ status }}
  </span>
</template>
