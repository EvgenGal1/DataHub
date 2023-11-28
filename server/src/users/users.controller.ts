import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  /* ApiBearerAuth, */ ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Controller('users')
// спец.тег swagger ч/з декоратор ApiTags для групп.мтд.cntrl users
@ApiTags('Пользователи/users')
// оборач.чтоб swagger знал что req на files защищены jwt Токеном
// @ApiBearerAuth()
export class UsersController {
  // ч/з внедр.завис. + UserEntity > раб.ч/з this с табл.users
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Создание Пользователя' })
  // декор.res.swagger: ApiResponse, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse
  @ApiResponse({
    status: 201,
    type: UserEntity,
    description: 'Ответ о создании Пользователя',
  })
  // получ.объ из запроса ч/з @Body
  create(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto : ' + createUserDto);
    console.log(createUserDto);
    // объ передаём в мтд.create в users.serv
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех Пользователей' })
  @ApiResponse({
    description: 'Получить всех',
    status: 200,
    type: [UserEntity],
  })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  findAll(/* @Query('usersIds') userIds?: string */) {
    return this.usersService.findAllUsers(/* userIds */);
  }

  // ОДИН трек.
  @Get(':id')
  @ApiOperation({ summary: 'Получить ч/з findOne' })
  @ApiCreatedResponse({ description: 'Описание findOne' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  // ! не отраж.в swgg
  @Get(':id')
  @ApiOperation({ summary: 'Получить ч/з findByEmail' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }
  // ! не отраж.в swgg
  @Get(':id')
  @ApiOperation({ summary: 'Получить ч/з findById' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление Пользователя' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление Пользователя' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // ^^ Расшир.мтд. ----------------------------------------------------------------------------
  // @ApiOperation({ summary: 'Выдать роль' })
  // @ApiResponse({ status: 200 })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  // @Post('/role')
  // addRole(@Body() dto: AddRoleDto) {
  //   return this.usersService.addRole(dto);
  // }

  // @ApiOperation({ summary: 'Забанить пользователя' })
  // @ApiResponse({ status: 200 })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  // @Post('/ban')
  // ban(@Body() dto: BanUserDto) {
  //   return this.usersService.ban(dto);
  // }

  // ~~ связь с конкретными ролями
  // @Post()
  // async createUserWithRoles(
  //   @Body('username') username: string,
  //   @Body('roles') roles: string[],
  // ) {
  //   const newUser = await this.usersService.createUserWithRoles(
  //     username,
  //     roles,
  //   );
  //   return newUser;
  // }
  //  ----------------------------------------------------------------------------------
  // ~~ Для получения пользователя (user), его роли (role) и уровня (level) из таблиц users, roles и user_roles
  // @Post('/userId')
  // async getUserRoleAndLevel(@Query('userId') userId: number) {
  //   console.log('userId : ' + userId);
  //   const user = await this.usersService.getUserRoleAndLevel(userId);
  //   return user;
  // }
}
