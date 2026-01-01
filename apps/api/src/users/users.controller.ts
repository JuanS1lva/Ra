import {
  Body,
  Controller,
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

@UseGuards(TenantGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @TenantId() tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.usersService.create(tenantId, createUserDto);

    return { user };
  }

  @Get()
  async listUsers(
    @TenantId() tenantId: string,
    @Query() { page = 1, limit = 20 }: ListUsersQueryDto,
  ) {
    const result = await this.usersService.findAll(tenantId, page, limit);

    return result;
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, tenantId, updateUserDto);

    return { user };
  }
}
