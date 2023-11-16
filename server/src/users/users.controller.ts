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
import { /* ApiBearerAuth, */ ApiTags } from '@nestjs/swagger';

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
  // получ.объ из запроса ч/з @Body
  create(@Body() createUserDto: CreateUserDto) {
    // объ передаём в мтд.create в users.serv
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get(':id')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
