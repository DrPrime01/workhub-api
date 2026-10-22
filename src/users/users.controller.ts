import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user-dto.js';
import { UserListQueryDto } from './dto/user-list-query.dto.js';
import { Roles } from '../common/decorators/roles/roles.decorator.js';
import { UserRole } from '../generated/prisma/enums.js';
import { CurrentUser } from '../common/decorators/current-user/current-user.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles([UserRole.ADMIN])
  @Get()
  getAll(@Query() { page, limit, sortBy, order, search }: UserListQueryDto) {
    return this.usersService.getAll(page, limit, sortBy, order, search);
  }

  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.delete(user.id, id);
  }
}
