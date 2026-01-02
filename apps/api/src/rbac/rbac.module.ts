import { Module, OnModuleInit } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { PrismaModule } from '../database/prisma/prisma.module';
import { PermissionsGuard } from './permissions.guard';
import { ContextModule } from '../context/context.module';

@Module({
  imports: [PrismaModule, ContextModule],
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
})
export class RbacModule implements OnModuleInit {
  constructor(private readonly rbacService: RbacService) {}

  async onModuleInit() {
    await this.rbacService.syncPermissionCatalog();
  }
}
