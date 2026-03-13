<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tenants } from '../api/tenants'
import type { Tenant } from '../api/tenants'
import StatusBadge from '../components/StatusBadge.vue'

const tenant = ref<Tenant | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)
const name = ref('')

onMounted(async () => {
  try {
    tenant.value = await tenants.me()
    name.value = tenant.value.name
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

async function save() {
  error.value = ''
  success.value = false
  saving.value = true
  try {
    tenant.value = await tenants.update({ name: name.value.trim() })
    success.value = true
    setTimeout(() => (success.value = false), 3000)
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="rounded-2xl bg-white border border-slate-200 h-48 animate-pulse" />

    <template v-else-if="tenant">
      <!-- Info card -->
      <div class="rounded-2xl bg-white border border-slate-200 px-6 py-5">
        <div class="flex items-start justify-between mb-5">
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ tenant.name }}</h2>
            <p class="text-xs text-slate-400 font-mono mt-1">{{ tenant.id }}</p>
          </div>
          <StatusBadge :status="tenant.status" />
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Created</p>
            <p class="text-slate-700 mt-1">{{ new Date(tenant.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Last updated</p>
            <p class="text-slate-700 mt-1">{{ new Date(tenant.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div class="rounded-2xl bg-white border border-slate-200 px-6 py-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-4">Edit organization</h3>
        <form class="space-y-4" @submit.prevent="save">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Organization name</label>
            <input
              v-model="name"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{{ error }}</div>

          <div v-if="success" class="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            Organization updated successfully.
          </div>

          <div class="flex items-center justify-between pt-1">
            <p class="text-xs text-slate-400">Status changes require direct database access.</p>
            <button
              type="submit"
              :disabled="saving || name.trim() === tenant.name"
              class="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </form>
      </div>
    </template>

    <div v-else class="rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>
