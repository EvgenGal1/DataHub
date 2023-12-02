import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  // ApiBearerAuth,
  // ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddingRolesToUsersDto } from 'src/roles/dto/add-roles-to-users.dto';
import { UserId } from 'src/decorators/user-id.decorator';
// import { UserEntity } from './entities/user.entity';

@Controller('users')
// спец.тег swagger ч/з декоратор ApiTags для групп.мтд.cntrl users
@ApiTags('Пользователи')
// оборач.чтоб swagger знал что req на files защищены jwt Токеном
// @ApiBearerAuth()
export class UsersController {
  // ч/з внедр.завис. + UsersService > раб.ч/з this с serv.users
  constructor(
    // private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}
  // URL_SERVER > доп.мтд.
  SERVER_URL: string = `http://localhost:${process.env.PORT}/`;

  @Post()
  @ApiOperation({ summary: 'Создание Пользователя' })
  // декор.res.swagger: ApiResponse, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse
  // @ApiResponse({
  //   status: 201,
  //   type: UserEntity,
  //   description: 'Ответ о создании Пользователя',
  // })
  // получ.объ из запроса ч/з @Body
  createUser(@Body() createUserDto: CreateUserDto) {
    // объ передаём в мтд.create в users.serv
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех Пользователей' })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  // ОДИН user.по id
  @Get(':id')
  @ApiOperation({ summary: 'Получить по ID' })
  // @ApiCreatedResponse({ description: 'Описание findOne' })
  findOneUser(@Param('id') id: string) {
    return this.usersService.findOneUser(+id);
  }
  // ОДИН user.по параметрам
  @Get('param/:param')
  @ApiOperation({ summary: 'Получить Usera по ID <> Email <> FullName' })
  findUserByValue(@Param('param') param: string) {
    return this.usersService.findUserByParam(param);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление Пользователя' })
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление Пользователя' })
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }
  // @Delete(':id')
  // @ApiOperation({ summary: 'Востановить Пользователя' })
  // restoreUser(@Param('id') id: string) {
  //   return this.usersService.restoreUser(+id);
  // }

  // ^^ мтд.> ADMIN ----------------------------------------------------------------------------------
  // добавить неск.Ролей к неск.Пользователям
  @Post('admin/addRolesToUsers')
  @ApiOperation({ summary: 'Добавить Роли к Пользователям' })
  async createUserRoles(
    @Body() addingRolesToUsersDto: AddingRolesToUsersDto,
  ): Promise<void> {
    console.log('addingRolesToUsersDto : ' + addingRolesToUsersDto);
    console.log(addingRolesToUsersDto);
    // await this.usersService.addingRolesToUsers(addingRolesToUsersDto);
  }

  // ^^ Расшир.мтд. ----------------------------------------------------------------------------
  // !! https://www.techiediaries.com/nestjs-upload-serve-static-file/
  // получ.аватар Пользователя. Раб.со статич.ф.
  @Get(':userid/avatar/:fileId')
  @ApiOperation({ summary: 'Открыть Аватар' })
  // из @`парам` взять id ф., возврат ответа
  async serveAvatar(
    @Param('fileId') fileId /* : string - не нужн.загр.добавляет */,
    @Res() res,
  ): Promise<any> {
    // id Изо, п.хран.Изо
    // в @`ответ`.`отправить файл`(с ф.id, {из п.хран.ф. './../..'})
    res.sendFile(fileId, { root: 'static/users/avatars' });
  }

  // загр.аватар Пользователя
  @Post(':userid/avatar')
  @ApiOperation({ summary: 'Добавить Аватар' })
  @ApiConsumes('multipart/form-data')
  // окно загр.ф.
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  // свой перехват > сохр.ф.с нов.name
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/users/avatars/',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadAvatar(
    // user id ч/з @Param || @UserId
    /* @Param('userid') userId */ @UserId() userId: number,
    @UploadedFile() file: Express.Multer.File /* file */,
  ) {
    // сохр./обнов. путь к аватару
    this.usersService.setAvatar(
      Number(userId),
      `${this.SERVER_URL}${file.path}`,
    );
  }

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
