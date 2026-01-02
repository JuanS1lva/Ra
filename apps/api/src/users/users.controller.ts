import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TenantGuard } from '../context/tenant.guard';
import { TenantId } from '../context/decorators/tenant-id.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';

@UseGuards(TenantGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions(['USER_CREATE'])
  async createUser(
    @TenantId() tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.usersService.create(tenantId, createUserDto);

    return { user };
  }

  @Get()
  @RequirePermissions(['USER_READ'])
  async listUsers(
    @TenantId() tenantId: string,
    @Query() { page = 1, limit = 20 }: ListUsersQueryDto,
  ) {
    const result = await this.usersService.findAll(tenantId, page, limit);

    return result;
  }

  @Patch(':id')
  @RequirePermissions(['USER_UPDATE'])
  async updateUser(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, tenantId, updateUserDto);

    return { user };
  }

  @Delete(':id')
  @RequirePermissions(['USER_DELETE'])
  async deleteUser(@Param('id') id: string, @TenantId() tenantId: string) {
    const user = await this.usersService.softDelete(id, tenantId);

    return { user };
  }
}
