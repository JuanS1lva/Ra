import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../database/prisma/prisma.module';
import { ContextModule } from '../context/context.module';
import { PermissionsGuard } from '../rbac/permissions.guard';

@Module({
  imports: [PrismaModule, ContextModule],
  controllers: [UsersController],
  providers: [UsersService, PermissionsGuard],
})
export class UsersModule {}
