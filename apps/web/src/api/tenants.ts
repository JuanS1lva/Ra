import { apiFetch } from './client'

export interface Tenant {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

export const tenants = {
  me: () => apiFetch<{ tenant: Tenant }>('/tenants/me').then((r) => r.tenant),
  update: (data: { name?: string }) =>
    apiFetch<{ tenant: Tenant }>('/tenants/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then((r) => r.tenant),
}
