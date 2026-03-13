import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContextStore = defineStore('context', () => {
  const tenantId = ref(localStorage.getItem('tenantId') ?? '')
  const userId = ref(localStorage.getItem('userId') ?? '')

  const isReady = computed(() => !!tenantId.value && !!userId.value)

  function setContext(tid: string, uid: string) {
    tenantId.value = tid
    userId.value = uid
    localStorage.setItem('tenantId', tid)
    localStorage.setItem('userId', uid)
  }

  function clearContext() {
    tenantId.value = ''
    userId.value = ''
    localStorage.removeItem('tenantId')
    localStorage.removeItem('userId')
  }

  return { tenantId, userId, isReady, setContext, clearContext }
})
