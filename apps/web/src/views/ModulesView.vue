<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { modules as modulesApi } from '../api/modules'
import type { AppModule } from '../api/modules'
import StatusBadge from '../components/StatusBadge.vue'

const list = ref<AppModule[]>([])
const loading = ref(true)
const error = ref('')
const toggling = ref<string | null>(null)

const icons: Record<string, string> = {
  tickets: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  docs: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'it-assets': 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await modulesApi.list()
    list.value = res.modules
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

function isEnabled(status: AppModule['status']) {
  return status === 'ACTIVE' || status === 'TRIAL'
}

async function toggle(mod: AppModule) {
  toggling.value = mod.id
  error.value = ''
  try {
    if (isEnabled(mod.status)) {
      await modulesApi.disable(mod.id)
    } else {
      await modulesApi.enable(mod.id)
    }
    await load()
  } catch (e: any) {
    error.value = e.message
  } finally {
    toggling.value = null
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-slate-500 dark:text-slate-400">Control which modules are available for this tenant.</p>

    <div v-if="error" class="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-5 py-3">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-40 animate-pulse"
      />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        v-for="mod in list"
        :key="mod.id"
        class="rounded-2xl bg-white dark:bg-slate-900 border px-6 py-5 flex flex-col gap-4 transition-all"
        :class="isEnabled(mod.status)
          ? 'border-orange-200 dark:border-orange-800 shadow-sm'
          : 'border-slate-200 dark:border-slate-800'"
      >
        <div class="flex items-start justify-between">
          <div
            class="h-11 w-11 rounded-xl flex items-center justify-center"
            :class="isEnabled(mod.status) ? 'bg-orange-100 dark:bg-orange-950' : 'bg-slate-100 dark:bg-slate-800'"
          >
            <svg
              class="h-5 w-5"
              :class="isEnabled(mod.status) ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="icons[mod.id] ?? icons['docs']" />
            </svg>
          </div>
          <StatusBadge :status="mod.status" />
        </div>

        <div>
          <p class="font-semibold text-slate-800 dark:text-slate-100">{{ mod.name }}</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize">{{ mod.id }}</p>
        </div>

        <button
          :disabled="toggling === mod.id"
          class="mt-auto w-full rounded-lg py-2 text-sm font-semibold transition-colors disabled:opacity-50"
          :class="isEnabled(mod.status)
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400'
            : 'bg-orange-500 text-white hover:bg-orange-600'"
          @click="toggle(mod)"
        >
          <span v-if="toggling === mod.id">Working…</span>
          <span v-else-if="isEnabled(mod.status)">Disable module</span>
          <span v-else>Enable module</span>
        </button>
      </div>
    </div>
  </div>
</template>
