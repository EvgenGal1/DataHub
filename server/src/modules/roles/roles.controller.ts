import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
// import { AddingRolesToUsersDto } from './dto/add-roles-to-users.dto';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Controller('/roles')
@ApiTags('Роли')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly logger: LoggingWinston,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать Роль' })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    this.logger.info(`req + Role: '${JSON.stringify(createRoleDto)}'`);
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Роли' })
  findAllRoles() {
    this.logger.info(`req << Roles All`);
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Роль по ID' })
  async findOneRole(@Param('id') id: number) {
    this.logger.info(`req < Role.ID '${id}'`);
    return this.rolesService.findOneRole(+id);
  }

  @Get('value/:value')
  @ApiOperation({ summary: 'Получить Роль по ID <> Значению' })
  async findRoleByValue(@Param('value') value: string) {
    this.logger.info(`req <? Role Value '${value}'`);
    return this.rolesService.findRoleByValue(value);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Роль' })
  updateRole(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    this.logger.info(`req # Role.ID '${id}'`);
    return this.rolesService.updateRole(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Роль' })
  removeRole(@Param('id') id: number) {
    this.logger.info(`req - Role.ID '${id}'`);
    return this.rolesService.removeRole(+id);
  }
  // @Delete(':id')
  // @ApiOperation({ summary: 'Востановить Роль' })
  // restoreRole(@Param('id') id: string) {
  //   return this.rolesService.restoreRole(+id);
  // }

  // ^^ мтд.> ADMIN
  // добавить неск.Ролей к неск.Пользователям
  // @Post('admin/addRolesToUsers')
  // @ApiOperation({ summary: 'Добавить Роли к Пользователям' })
  // async createUserRoles(
  //   @Body() addingRolesToUsersDto: AddingRolesToUsersDto,
  // ): Promise<void> {
  //   this.logger.info(
  //     `req + Role в User: '${JSON.stringify(addingRolesToUsersDto)}'`,
  //   );
  //   this.rolesService.addingRolesToUsers(addingRolesToUsersDto);
  // }
}
