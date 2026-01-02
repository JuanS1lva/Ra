import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../database/prisma/prisma.module';
import { ContextModule } from '../context/context.module';
import { PermissionsGuard } from '../rbac/permissions.guard';

@Module({
  imports: [PrismaModule, ContextModule],
  controllers: [TenantsController],
  providers: [TenantsService, PermissionsGuard],
})
export class TenantsModule {}
