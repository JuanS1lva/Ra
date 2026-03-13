<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContextStore } from '../stores/context'

const ctx = useContextStore()
const router = useRouter()

const tenantId = ref('')
const userId = ref('')
const error = ref('')

function submit() {
  error.value = ''
  if (!tenantId.value.trim() || !userId.value.trim()) {
    error.value = 'Both fields are required.'
    return
  }
  ctx.setContext(tenantId.value.trim(), userId.value.trim())
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex bg-slate-900">
    <!-- Left brand panel -->
    <div class="hidden lg:flex w-1/2 flex-col justify-between p-12">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center">
          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        </div>
        <span class="text-white font-bold text-xl tracking-tight">APPBASE</span>
      </div>

      <div class="space-y-6">
        <div>
          <p class="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Modular intranet platform</p>
          <h2 class="text-4xl font-bold text-white leading-tight">
            Everything your team<br />needs in one place.
          </h2>
          <p class="mt-4 text-slate-400 text-base leading-relaxed">
            Manage users, roles, permissions, and modules from a single control panel tailored to your organization.
          </p>
        </div>

        <div class="flex gap-6">
          <div class="rounded-xl bg-slate-800 px-5 py-4">
            <p class="text-2xl font-bold text-white">3</p>
            <p class="text-slate-400 text-xs mt-0.5">Core modules</p>
          </div>
          <div class="rounded-xl bg-slate-800 px-5 py-4">
            <p class="text-2xl font-bold text-white">11</p>
            <p class="text-slate-400 text-xs mt-0.5">Permissions</p>
          </div>
          <div class="rounded-xl bg-slate-800 px-5 py-4">
            <p class="text-2xl font-bold text-white">∞</p>
            <p class="text-slate-400 text-xs mt-0.5">Tenants</p>
          </div>
        </div>
      </div>

      <p class="text-slate-600 text-xs">APPBASE — Local dev environment</p>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="flex items-center gap-2 mb-8 lg:hidden">
          <div class="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
          </div>
          <span class="text-slate-900 dark:text-white font-bold text-lg">APPBASE</span>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Enter your session</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Paste your Tenant ID and User ID to access the panel.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="submit">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tenant ID</label>
              <input
                v-model="tenantId"
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">User ID</label>
              <input
                v-model="userId"
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>

            <button
              type="submit"
              class="w-full rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2.5 text-sm transition-colors"
            >
              Enter panel →
            </button>
          </form>

          <div class="mt-6 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">How to find your IDs</p>
            <ol class="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
              <li>Start the API: <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">docker compose up api db redis</code></li>
              <li>Run: <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">cd apps/api && pnpm prisma:studio</code></li>
              <li>Open <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">localhost:5555</code> → Tenant / User tables</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
