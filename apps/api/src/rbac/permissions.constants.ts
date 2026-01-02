export const PERMISSIONS = [
  {
    code: 'TENANT_READ',
    description: 'Read tenant details',
  },
  {
    code: 'TENANT_UPDATE',
    description: 'Update tenant details',
  },
  {
    code: 'USER_CREATE',
    description: 'Create users within the tenant',
  },
  {
    code: 'USER_READ',
    description: 'Read users within the tenant',
  },
  {
    code: 'USER_UPDATE',
    description: 'Update users within the tenant',
  },
  {
    code: 'USER_DELETE',
    description: 'Delete users within the tenant',
  },
  {
    code: 'ROLE_CREATE',
    description: 'Create roles within the tenant',
  },
  {
    code: 'ROLE_READ',
    description: 'Read roles within the tenant',
  },
  {
    code: 'ROLE_UPDATE',
    description: 'Update roles within the tenant',
  },
  {
    code: 'ROLE_ASSIGN',
    description: 'Assign roles to users',
  },
  {
    code: 'PERMISSION_ASSIGN',
    description: 'Assign permissions to roles',
  },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]['code'];
