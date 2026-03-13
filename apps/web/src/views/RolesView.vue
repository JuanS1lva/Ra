<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { roles as rolesApi } from '../api/roles'
import type { Role, Permission } from '../api/roles'
import BaseModal from '../components/BaseModal.vue'

const list = ref<Role[]>([])
const allPermissions = ref<Permission[]>([])
const loading = ref(true)
const error = ref('')

// Create modal
const showCreate = ref(false)
const creating = ref(false)
const newRoleName = ref('')
const createError = ref('')

// Permissions modal
const showPerms = ref(false)
const savingPerms = ref(false)
const permsTarget = ref<Role | null>(null)
const selectedCodes = ref<string[]>([])
const permsError = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [r, p] = await Promise.all([rolesApi.list(), rolesApi.listPermissions()])
    list.value = r
    allPermissions.value = p
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function createRole() {
  createError.value = ''
  creating.value = true
  try {
    await rolesApi.create(newRoleName.value.trim())
    showCreate.value = false
    newRoleName.value = ''
    await load()
  } catch (e: any) {
    createError.value = e.message
  } finally {
    creating.value = false
  }
}

function openPerms(role: Role) {
  permsTarget.value = role
  selectedCodes.value = role.permissions.map((p) => p.permission.code)
  permsError.value = ''
  showPerms.value = true
}

function togglePerm(code: string) {
  const idx = selectedCodes.value.indexOf(code)
  if (idx >= 0) selectedCodes.value.splice(idx, 1)
  else selectedCodes.value.push(code)
}

async function savePerms() {
  if (!permsTarget.value) return
  permsError.value = ''
  savingPerms.value = true
  try {
    await rolesApi.assignPermissions(permsTarget.value.id, selectedCodes.value)
    showPerms.value = false
    await load()
  } catch (e: any) {
    permsError.value = e.message
  } finally {
    savingPerms.value = false
  }
}

// Group permissions by resource
const grouped = (perms: Permission[]) => {
  const map: Record<string, Permission[]> = {}
  for (const p of perms) {
    const resource = p.code.split('_')[0]
    ;(map[resource] ??= []).push(p)
  }
  return map
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ list.length }} role{{ list.length !== 1 ? 's' : '' }}</p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold transition-colors"
        @click="showCreate = true"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New role
      </button>
    </div>

    <div v-if="error" class="rounded-xl bg-red-50 border border-red-200 px-5 py-3">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-3">
      <div v-for="i in 3" :key="i" class="rounded-2xl bg-white border border-slate-200 h-20 animate-pulse" />
    </div>

    <!-- Roles grid -->
    <div v-else class="grid gap-3">
      <div
        v-for="role in list"
        :key="role.id"
        class="rounded-2xl bg-white border border-slate-200 px-5 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-slate-800">{{ role.name }}</p>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ role.permissions.length }} permission{{ role.permissions.length !== 1 ? 's' : '' }}
              <span v-if="role.permissions.length > 0" class="ml-1 text-slate-300">·</span>
              <span v-if="role.permissions.length > 0" class="ml-1">
                {{ role.permissions.slice(0, 3).map((p) => p.permission.code).join(', ') }}{{ role.permissions.length > 3 ? '…' : '' }}
              </span>
            </p>
          </div>
        </div>
        <button
          class="rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 font-medium transition-colors border border-slate-200"
          @click="openPerms(role)"
        >
          Edit permissions
        </button>
      </div>

      <div v-if="list.length === 0" class="rounded-2xl bg-white border border-slate-200 px-5 py-12 text-center">
        <p class="text-slate-400 text-sm">No roles yet. Create one to get started.</p>
      </div>
    </div>
  </div>

  <!-- Create modal -->
  <BaseModal title="New role" :open="showCreate" @close="showCreate = false">
    <form class="space-y-4" @submit.prevent="createRole">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Role name</label>
        <input
          v-model="newRoleName"
          type="text"
          required
          placeholder="e.g. Manager"
          class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <div v-if="createError" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{{ createError }}</div>
      <div class="flex justify-end gap-3 pt-1">
        <button type="button" class="px-4 py-2 text-sm text-slate-600" @click="showCreate = false">Cancel</button>
        <button
          type="submit"
          :disabled="creating"
          class="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {{ creating ? 'Creating…' : 'Create role' }}
        </button>
      </div>
    </form>
  </BaseModal>

  <!-- Permissions modal -->
  <BaseModal :title="`Permissions — ${permsTarget?.name ?? ''}`" :open="showPerms" @close="showPerms = false">
    <div class="max-h-96 overflow-y-auto space-y-4">
      <div v-for="(perms, resource) in grouped(allPermissions)" :key="resource">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{{ resource }}</p>
        <div class="space-y-1.5">
          <label
            v-for="perm in perms"
            :key="perm.code"
            class="flex items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
            :class="selectedCodes.includes(perm.code) ? 'border-orange-300 bg-orange-50' : ''"
          >
            <input
              type="checkbox"
              :checked="selectedCodes.includes(perm.code)"
              class="accent-orange-500"
              @change="togglePerm(perm.code)"
            />
            <div>
              <p class="text-sm font-medium text-slate-700 font-mono">{{ perm.code }}</p>
              <p class="text-xs text-slate-400">{{ perm.description }}</p>
            </div>
          </label>
        </div>
      </div>
    </div>
    <div v-if="permsError" class="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{{ permsError }}</div>
    <div class="flex items-center justify-between mt-4">
      <p class="text-xs text-slate-400">{{ selectedCodes.length }} selected</p>
      <div class="flex gap-3">
        <button class="px-4 py-2 text-sm text-slate-600" @click="showPerms = false">Cancel</button>
        <button
          :disabled="savingPerms"
          class="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
          @click="savePerms"
        >
          {{ savingPerms ? 'Saving…' : 'Save permissions' }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
