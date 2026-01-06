import { Module } from '@nestjs/common';
import { ModulesRegistryController } from './modules-registry.controller';
import { ModulesRegistryService } from './modules-registry.service';
import { PrismaModule } from '../database/prisma/prisma.module';
import { ModuleEnabledGuard } from './module-enabled.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ModulesRegistryController],
  providers: [ModulesRegistryService, ModuleEnabledGuard],
  exports: [ModulesRegistryService, ModuleEnabledGuard],
})
export class ModulesRegistryModule {}
