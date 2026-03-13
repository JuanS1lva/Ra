<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { users as usersApi } from '../api/users'
import { roles as rolesApi } from '../api/roles'
import type { User } from '../api/users'
import type { Role } from '../api/roles'
import StatusBadge from '../components/StatusBadge.vue'
import BaseModal from '../components/BaseModal.vue'

const list = ref<User[]>([])
const allRoles = ref<Role[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const error = ref('')

// Create modal
const showCreate = ref(false)
const creating = ref(false)
const createForm = ref({ name: '', email: '' })
const createError = ref('')

// Edit modal
const showEdit = ref(false)
const editing = ref(false)
const editTarget = ref<User | null>(null)
const editForm = ref({ name: '', isActive: true })
const editError = ref('')

// Roles modal
const showRoles = ref(false)
const assigningRoles = ref(false)
const rolesTarget = ref<User | null>(null)
const selectedRoleIds = ref<string[]>([])
const rolesError = ref('')

// Delete modal
const showDelete = ref(false)
const deleting = ref(false)
const deleteTarget = ref<User | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await usersApi.list(page.value)
    list.value = res.users || []
    total.value = res.pagination?.total || 0
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([load(), rolesApi.list().then((r) => (allRoles.value = r))])
})

async function createUser() {
  createError.value = ''
  creating.value = true
  try {
    await usersApi.create(createForm.value)
    showCreate.value = false
    createForm.value = { name: '', email: '' }
    await load()
  } catch (e: any) {
    createError.value = e.message
  } finally {
    creating.value = false
  }
}

function openEdit(user: User) {
  editTarget.value = user
  editForm.value = { name: user.name, isActive: user.isActive }
  editError.value = ''
  showEdit.value = true
}

async function updateUser() {
  if (!editTarget.value) return
  editError.value = ''
  editing.value = true
  try {
    await usersApi.update(editTarget.value.id, editForm.value)
    showEdit.value = false
    await load()
  } catch (e: any) {
    editError.value = e.message
  } finally {
    editing.value = false
  }
}

function openRoles(user: User) {
  rolesTarget.value = user
  selectedRoleIds.value = user.roles?.map((r) => r.role.id) ?? []
  rolesError.value = ''
  showRoles.value = true
}

async function saveRoles() {
  if (!rolesTarget.value) return
  rolesError.value = ''
  assigningRoles.value = true
  try {
    await usersApi.assignRoles(rolesTarget.value.id, selectedRoleIds.value)
    showRoles.value = false
    await load()
  } catch (e: any) {
    rolesError.value = e.message
  } finally {
    assigningRoles.value = false
  }
}

function toggleRole(id: string) {
  const idx = selectedRoleIds.value.indexOf(id)
  if (idx >= 0) selectedRoleIds.value.splice(idx, 1)
  else selectedRoleIds.value.push(id)
}

function openDelete(user: User) {
  deleteTarget.value = user
  showDelete.value = true
}

async function deleteUser() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await usersApi.delete(deleteTarget.value.id)
    showDelete.value = false
    await load()
  } catch (e: any) {
    error.value = e.message
  } finally {
    deleting.value = false
  }
}

const pages = () => Math.ceil(total.value / 20)
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ total }} user{{ total !== 1 ? 's' : '' }}</p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold transition-colors"
        @click="showCreate = true"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New user
      </button>
    </div>

    <div v-if="error" class="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-5 py-3">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Table -->
    <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="px-5 py-12 text-center">
              <div class="inline-flex items-center gap-2 text-slate-400 text-sm">
                <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading…
              </div>
            </td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="4" class="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">No users yet.</td>
          </tr>
          <tr
            v-for="user in list"
            :key="user.id"
            class="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                  <span class="text-orange-600 dark:text-orange-400 font-semibold text-xs">{{ user.name.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ user.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">{{ user.email }}</td>
            <td class="px-5 py-3.5">
              <StatusBadge :status="user.isActive ? 'ACTIVE' : 'INACTIVE'" />
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center justify-end gap-1">
                <button
                  class="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                  @click="openRoles(user)"
                >
                  Roles
                </button>
                <button
                  class="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                  @click="openEdit(user)"
                >
                  Edit
                </button>
                <button
                  class="rounded-lg px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-medium transition-colors"
                  @click="openDelete(user)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pages() > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
        <button
          class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="page <= 1"
          @click="page--; load()"
        >
          ← Previous
        </button>
        <span class="text-xs text-slate-400 dark:text-slate-500">Page {{ page }} of {{ pages() }}</span>
        <button
          class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="page >= pages()"
          @click="page++; load()"
        >
          Next →
        </button>
      </div>
    </div>
  </div>

  <!-- Create modal -->
  <BaseModal title="New user" :open="showCreate" @close="showCreate = false">
    <form class="space-y-4" @submit.prevent="createUser">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
        <input
          v-model="createForm.name"
          type="text"
          required
          placeholder="Jane Doe"
          class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
        <input
          v-model="createForm.email"
          type="email"
          required
          placeholder="jane@example.com"
          class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <div v-if="createError" class="rounded-lg bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">{{ createError }}</div>
      <div class="flex justify-end gap-3 pt-1">
        <button type="button" class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" @click="showCreate = false">Cancel</button>
        <button
          type="submit"
          :disabled="creating"
          class="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {{ creating ? 'Creating…' : 'Create user' }}
        </button>
      </div>
    </form>
  </BaseModal>

  <!-- Edit modal -->
  <BaseModal title="Edit user" :open="showEdit" @close="showEdit = false">
    <form class="space-y-4" @submit.prevent="updateUser">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
        <input
          v-model="editForm.name"
          type="text"
          required
          class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
          :class="editForm.isActive ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'"
          @click="editForm.isActive = !editForm.isActive"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="editForm.isActive ? 'translate-x-4' : 'translate-x-0'"
          />
        </button>
        <label class="text-sm text-slate-700 dark:text-slate-300">Active</label>
      </div>
      <div v-if="editError" class="rounded-lg bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">{{ editError }}</div>
      <div class="flex justify-end gap-3 pt-1">
        <button type="button" class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" @click="showEdit = false">Cancel</button>
        <button
          type="submit"
          :disabled="editing"
          class="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {{ editing ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </form>
  </BaseModal>

  <!-- Roles modal -->
  <BaseModal :title="`Assign roles — ${rolesTarget?.name ?? ''}`" :open="showRoles" @close="showRoles = false">
    <div class="space-y-3 max-h-72 overflow-y-auto">
      <label
        v-for="role in allRoles"
        :key="role.id"
        class="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
        :class="selectedRoleIds.includes(role.id)
          ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950'
          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'"
      >
        <input
          type="checkbox"
          :checked="selectedRoleIds.includes(role.id)"
          class="accent-orange-500"
          @change="toggleRole(role.id)"
        />
        <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ role.name }}</span>
        <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">{{ role.permissions.length }} perms</span>
      </label>
    </div>
    <div v-if="rolesError" class="mt-3 rounded-lg bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">{{ rolesError }}</div>
    <div class="flex justify-end gap-3 mt-4">
      <button class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" @click="showRoles = false">Cancel</button>
      <button
        :disabled="assigningRoles"
        class="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
        @click="saveRoles"
      >
        {{ assigningRoles ? 'Saving…' : 'Save roles' }}
      </button>
    </div>
  </BaseModal>

  <!-- Delete modal -->
  <BaseModal title="Delete user" :open="showDelete" @close="showDelete = false">
    <p class="text-sm text-slate-600 dark:text-slate-300">
      Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>? This action can be undone via the database.
    </p>
    <div class="flex justify-end gap-3 mt-5">
      <button class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" @click="showDelete = false">Cancel</button>
      <button
        :disabled="deleting"
        class="rounded-lg bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
        @click="deleteUser"
      >
        {{ deleting ? 'Deleting…' : 'Delete user' }}
      </button>
    </div>
  </BaseModal>
</template>
