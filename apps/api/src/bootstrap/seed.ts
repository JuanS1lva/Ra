import 'dotenv/config';
import { PrismaClient, SubscriptionStatus, TenantStatus } from '@prisma/client';
import { PERMISSIONS } from '../rbac/permissions.constants';
import { MODULE_CATALOG } from '../modules-registry/modules-registry.service';

const DEMO_TENANT_NAME = 'Demo';
const ADMIN_ROLE_NAME = 'Admin';
const DEMO_ADMIN_NAME = 'Demo Admin';
const DEMO_ADMIN_EMAIL = 'admin@demo.com';
const BASE_MODULE_IDS = ['tickets', 'docs', 'it-assets'] as const;

const prisma = new PrismaClient();

type ModuleId = (typeof BASE_MODULE_IDS)[number];

async function ensurePermissionCatalog() {
  await prisma.$transaction(
    PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: { code: permission.code },
        update: { description: permission.description, deletedAt: null },
        create: permission,
      }),
    ),
  );

  return prisma.permission.findMany({ where: { deletedAt: null } });
}

async function ensureDemoTenant() {
  const existing = await prisma.tenant.findFirst({
    where: { name: DEMO_TENANT_NAME },
    orderBy: { createdAt: 'asc' },
  });

  if (existing) {
    return prisma.tenant.update({
      where: { id: existing.id },
      data: { name: DEMO_TENANT_NAME, status: TenantStatus.ACTIVE, deletedAt: null },
    });
  }

  return prisma.tenant.create({
    data: {
      name: DEMO_TENANT_NAME,
      status: TenantStatus.ACTIVE,
    },
  });
}

async function ensureAdminRole(tenantId: string) {
  return prisma.role.upsert({
    where: { tenantId_name: { tenantId, name: ADMIN_ROLE_NAME } },
    update: { deletedAt: null },
    create: { tenantId, name: ADMIN_ROLE_NAME },
  });
}

async function attachPermissionsToRole(roleId: string, tenantId: string, permissionIds: string[]) {
  await prisma.$transaction(
    permissionIds.map((permissionId) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: { deletedAt: null, tenantId },
        create: { roleId, permissionId, tenantId },
      }),
    ),
  );
}

async function ensureAdminUser(tenantId: string) {
  return prisma.user.upsert({
    where: { tenantId_email: { tenantId, email: DEMO_ADMIN_EMAIL } },
    update: { name: DEMO_ADMIN_NAME, isActive: true, deletedAt: null },
    create: { tenantId, name: DEMO_ADMIN_NAME, email: DEMO_ADMIN_EMAIL },
  });
}

async function attachRoleToUser(userId: string, roleId: string, tenantId: string) {
  return prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: { deletedAt: null, tenantId },
    create: { userId, roleId, tenantId },
  });
}

async function enableBaseModules(tenantId: string) {
  const catalogIds = new Set(MODULE_CATALOG.map((module) => module.id as ModuleId));

  const modulesToEnable = BASE_MODULE_IDS.filter((moduleId) => catalogIds.has(moduleId));

  await Promise.all(
    modulesToEnable.map(async (moduleId) => {
      const latestSubscription = await prisma.moduleSubscription.findFirst({
        where: { tenantId, moduleId },
        orderBy: { createdAt: 'desc' },
      });

      const plan = latestSubscription?.plan ?? 'default';

      if (latestSubscription) {
        return prisma.moduleSubscription.update({
          where: { id: latestSubscription.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            plan,
            deletedAt: null,
          },
        });
      }

      return prisma.moduleSubscription.create({
        data: {
          tenantId,
          moduleId,
          status: SubscriptionStatus.ACTIVE,
          plan,
        },
      });
    }),
  );
}

async function main() {
  console.log('Synchronizing permission catalog...');
  const permissions = await ensurePermissionCatalog();

  console.log('Ensuring Demo tenant...');
  const tenant = await ensureDemoTenant();

  console.log('Ensuring Admin role...');
  const role = await ensureAdminRole(tenant.id);

  console.log('Assigning all permissions to Admin role...');
  await attachPermissionsToRole(
    role.id,
    tenant.id,
    permissions.map((permission) => permission.id),
  );

  console.log('Ensuring Demo admin user...');
  const user = await ensureAdminUser(tenant.id);

  console.log('Assigning Admin role to user...');
  await attachRoleToUser(user.id, role.id, tenant.id);

  console.log('Enabling base modules...');
  await enableBaseModules(tenant.id);

  console.log('Seeding completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
