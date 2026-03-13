<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContextStore } from '../stores/context'

const route = useRoute()
const router = useRouter()
const ctx = useContextStore()

const nav = [
  { name: 'Dashboard', to: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Users', to: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Roles', to: '/roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { name: 'Modules', to: '/modules', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { name: 'Tenant', to: '/tenant', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

const pageTitle = computed(() => {
  const match = nav.find((n) => {
    if (n.to === '/') return route.path === '/'
    return route.path.startsWith(n.to)
  })
  return match?.name ?? 'APPBASE'
})

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

function logout() {
  ctx.clearContext()
  router.push('/setup')
}
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-60 flex-shrink-0 flex flex-col" style="background: #0f172a">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <span class="text-white font-bold text-base tracking-tight">APPBASE</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group"
          :class="isActive(item.to)
            ? 'bg-orange-500 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'"
        >
          <svg class="h-4.5 w-4.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
          </svg>
          {{ item.name }}
        </RouterLink>
      </nav>

      <!-- Session info -->
      <div class="p-4 border-t border-slate-800">
        <div class="rounded-lg bg-slate-800 p-3 space-y-2">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Tenant ID</p>
            <p class="text-xs text-slate-300 font-mono mt-0.5 truncate">{{ ctx.tenantId }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">User ID</p>
            <p class="text-xs text-slate-300 font-mono mt-0.5 truncate">{{ ctx.userId }}</p>
          </div>
          <button
            class="mt-1 w-full text-xs text-slate-500 hover:text-red-400 transition-colors text-left"
            @click="logout"
          >
            → Switch session
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top bar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <h1 class="text-lg font-semibold text-slate-800">{{ pageTitle }}</h1>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
