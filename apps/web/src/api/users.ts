import { apiFetch } from './client'

export interface User {
  id: string
  tenantId: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  roles?: Array<{ role: { id: string; name: string } }>
}

export interface UsersPage {
  users: User[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const users = {
  list: (page = 1, limit = 20) =>
    apiFetch<UsersPage>(`/users?page=${page}&limit=${limit}`),

  create: (data: { name: string; email: string }) =>
    apiFetch<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => r.user),

  update: (id: string, data: { name?: string; isActive?: boolean }) =>
    apiFetch<{ user: User }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then((r) => r.user),

  delete: (id: string) =>
    apiFetch<{ user: User }>(`/users/${id}`, { method: 'DELETE' }).then((r) => r.user),

  assignRoles: (userId: string, roleIds: string[]) =>
    apiFetch(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ roleIds }),
    }),
}
