import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../database/prisma/prisma.module';
import { ContextModule } from '../context/context.module';

@Module({
  imports: [PrismaModule, ContextModule],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
