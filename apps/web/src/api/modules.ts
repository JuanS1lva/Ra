import { apiFetch } from './client'

export interface AppModule {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELED' | 'DISABLED'
}

export interface ModulesResponse {
  tenantStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  modules: AppModule[]
}

export const modules = {
  list: () => apiFetch<ModulesResponse>('/modules'),
  enable: (moduleId: string) =>
    apiFetch(`/modules/${moduleId}/enable`, { method: 'POST' }),
  disable: (moduleId: string) =>
    apiFetch(`/modules/${moduleId}/disable`, { method: 'POST' }),
}
