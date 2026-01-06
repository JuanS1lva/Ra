import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { ModuleSubscription, SubscriptionStatus, TenantStatus } from '@prisma/client';

export type ModuleDefinition = {
  id: string;
  name: string;
};

export type ModuleWithStatus = ModuleDefinition & {
  status: SubscriptionStatus | 'DISABLED';
};

export const MODULE_CATALOG: ModuleDefinition[] = [
  { id: 'tickets', name: 'Tickets' },
  { id: 'docs', name: 'Docs' },
  { id: 'it-assets', name: 'IT Assets' },
];

@Injectable()
export class ModulesRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  getCatalog(): ModuleDefinition[] {
    return MODULE_CATALOG;
  }

  private ensureValidModuleId(moduleId: string) {
    const exists = MODULE_CATALOG.some((module) => module.id === moduleId);

    if (!exists) {
      throw new NotFoundException('Module not found');
    }
  }

  private async getTenantOrFail(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  private pickLatestSubscriptions(subscriptions: ModuleSubscription[]): Map<string, ModuleSubscription> {
    const moduleSubscriptionMap = new Map<string, ModuleSubscription>();

    for (const subscription of subscriptions) {
      if (!moduleSubscriptionMap.has(subscription.moduleId)) {
        moduleSubscriptionMap.set(subscription.moduleId, subscription);
      }
    }

    return moduleSubscriptionMap;
  }

  async listModules(tenantId: string): Promise<{ tenantStatus: TenantStatus; modules: ModuleWithStatus[] }> {
    const tenant = await this.getTenantOrFail(tenantId);
    const subscriptions = await this.prisma.moduleSubscription.findMany({
      where: { tenantId, moduleId: { in: MODULE_CATALOG.map((module) => module.id) } },
      orderBy: { createdAt: 'desc' },
    });

    const subscriptionMap = this.pickLatestSubscriptions(subscriptions);

    const modules: ModuleWithStatus[] = MODULE_CATALOG.map((module) => {
      const subscription = subscriptionMap.get(module.id);

      return {
        ...module,
        status: subscription && !subscription.deletedAt ? subscription.status : 'DISABLED',
      };
    });

    return { tenantStatus: tenant.status, modules };
  }

  async enableModule(tenantId: string, moduleId: string) {
    this.ensureValidModuleId(moduleId);
    await this.getTenantOrFail(tenantId);

    const existing = await this.prisma.moduleSubscription.findFirst({
      where: { tenantId, moduleId },
      orderBy: { createdAt: 'desc' },
    });

    const subscription = existing
      ? await this.prisma.moduleSubscription.update({
          where: { id: existing.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            plan: existing.plan,
            deletedAt: null,
          },
        })
      : await this.prisma.moduleSubscription.create({
          data: {
            tenantId,
            moduleId,
            status: SubscriptionStatus.ACTIVE,
            plan: 'default',
          },
        });

    return subscription;
  }

  async disableModule(tenantId: string, moduleId: string) {
    this.ensureValidModuleId(moduleId);
    await this.getTenantOrFail(tenantId);

    const subscription = await this.prisma.moduleSubscription.findFirst({
      where: { tenantId, moduleId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.moduleSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });
  }

  async isModuleEnabled(tenantId: string, moduleId: string): Promise<boolean> {
    this.ensureValidModuleId(moduleId);

    const subscription = await this.prisma.moduleSubscription.findFirst({
      where: { tenantId, moduleId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return (
      !!subscription &&
      (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIAL)
    );
  }
}
