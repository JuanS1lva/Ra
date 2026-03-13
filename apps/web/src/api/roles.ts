import { apiFetch } from './client'

export interface Permission {
  id: string
  code: string
  description: string
}

export interface Role {
  id: string
  tenantId: string
  name: string
  permissions: Array<{ permission: Permission }>
}

export const roles = {
  list: () => apiFetch<{ roles: Role[] }>('/roles').then((r) => r.roles),

  create: (name: string) =>
    apiFetch<{ role: Role }>('/roles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }).then((r) => r.role),

  listPermissions: () =>
    apiFetch<{ permissions: Permission[] }>('/permissions').then((r) => r.permissions),

  assignPermissions: (roleId: string, permissionCodes: string[]) =>
    apiFetch<{ role: Role }>(`/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionCodes }),
    }).then((r) => r.role),
}
