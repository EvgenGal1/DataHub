// обраб.req/res
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
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
// спец.тег swagger ч/з декоратор ApiTags для групп.мтд.cntrl users
@ApiTags('users')
// оборач.чтоб swagger знал что req на files защищены jwt Токеном
// @ApiBearerAuth()
export class UsersController {
  // ч/з внедр.завис. + UserEntity > раб.ч/з this с табл.users
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Добавить Пользователя' })
  @ApiCreatedResponse({ description: 'Добавить Пользователя' })
  // получ.объ из запроса ч/з @Body
  create(@Body() createUserDto: CreateUserDto) {
    // объ передаём в мтд.create в users.serv
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех' })
  @ApiCreatedResponse({ description: 'Получить всех' })
  findAll() {
    return this.usersService.findAll();
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
}
