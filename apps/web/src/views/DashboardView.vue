<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tenants } from '../api/tenants'
import { users } from '../api/users'
import { roles } from '../api/roles'
import { modules } from '../api/modules'
import StatusBadge from '../components/StatusBadge.vue'
import type { Tenant } from '../api/tenants'
import type { ModulesResponse } from '../api/modules'

const router = useRouter()

const tenant = ref<Tenant | null>(null)
const userCount = ref(0)
const roleCount = ref(0)
const modulesData = ref<ModulesResponse | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const [t, u, r, m] = await Promise.all([
      tenants.me(),
      users.list(1, 1),
      roles.list(),
      modules.list(),
    ])
    tenant.value = t
    userCount.value = u.pagination?.total ?? 0
    roleCount.value = r.length
    modulesData.value = m
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const activeModules = () =>
  modulesData.value?.modules.filter((m) => m.status === 'ACTIVE' || m.status === 'TRIAL').length ?? 0
</script>

<template>
  <div class="space-y-6">
    <div v-if="error" class="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-5 py-4">
      <p class="text-sm text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
    </div>

    <!-- Tenant header -->
    <div
      v-if="!loading && tenant"
      class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5 flex items-center justify-between"
    >
      <div>
        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">Organization</p>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ tenant.name }}</h2>
      </div>
      <StatusBadge :status="tenant.status" />
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-3 gap-4">
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-24 animate-pulse"
      />
    </div>

    <!-- Stats -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5 text-left hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group"
        @click="router.push('/users')"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Total users</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white mt-1">{{ userCount }}</p>
          </div>
          <div class="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
            <svg class="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-3 group-hover:text-orange-500 transition-colors">Manage users →</p>
      </button>

      <button
        class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5 text-left hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group"
        @click="router.push('/roles')"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Roles</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white mt-1">{{ roleCount }}</p>
          </div>
          <div class="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
            <svg class="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-3 group-hover:text-orange-500 transition-colors">Manage roles →</p>
      </button>

      <button
        class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5 text-left hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group"
        @click="router.push('/modules')"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Active modules</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white mt-1">{{ activeModules() }}</p>
          </div>
          <div class="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
            <svg class="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-3 group-hover:text-orange-500 transition-colors">Manage modules →</p>
      </button>
    </div>

    <!-- Modules overview -->
    <div v-if="modulesData" class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Module status</h3>
      <div class="space-y-2">
        <div
          v-for="mod in modulesData.modules"
          :key="mod.id"
          class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-2 w-2 rounded-full"
              :class="mod.status === 'ACTIVE' || mod.status === 'TRIAL' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
            />
            <span class="text-sm text-slate-700 dark:text-slate-300 capitalize">{{ mod.name }}</span>
          </div>
          <StatusBadge :status="mod.status" />
        </div>
      </div>
    </div>
  </div>
</template>
