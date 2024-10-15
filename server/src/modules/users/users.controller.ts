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
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  // ApiQuery,
  // ApiBearerAuth,
  // ApiResponse,
} from '@nestjs/swagger';
import {
  FileInterceptor,
  // FileFieldsInterceptor,
} from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddingRolesToUsersDto } from '../roles/dto/add-roles-to-users.dto';
import { UserId } from '../../common/decorators/user-id.decorator';
import { fileStorage } from '../../services/storage/storage';
import { LoggingWinston } from '../../services/logging/logging.winston';
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
    private readonly usersService: UsersService,
    // логи
    private readonly logger: LoggingWinston,
  ) {}
  // URL_SERVER > доп.мтд.
  // SERVER_URL: string = `http://localhost:${process.env.PORT}/`;

  @Post()
  @ApiOperation({ summary: 'Создание Пользователя' })
  // декор.res.swagger: ApiResponse, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse
  // @ApiResponse({
  //   status: 201,
  //   type: UserEntity,
  //   description: 'Ответ о создании Пользователя',
  // })
  // получ.объ из запроса ч/з @Body
  async createUser(@Body() createUserDto: CreateUserDto) {
    // логи
    // this.logger.info(`create user`);
    // объ передаём в мтд.create в users.serv
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех Пользователей' })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  async findAllUsers() {
    // this.logger.info(`ALL.users`);
    return await this.usersService.findAllUsers();
  }

  // ОДИН user.по id
  @Get(':id')
  @ApiOperation({ summary: 'Получить по ID' })
  // @ApiCreatedResponse({ description: 'Описание findOne' })
  async findOneUser(@Param('id') id: string /* ObjectId */) {
    // this.logger.info(`res.user ID: ${id}`);
    return await this.usersService.findOneUser(+id);
  }

  // ОДИН user.по параметрам ID <> Email <> FullName
  @Get('param/:param')
  @ApiOperation({ summary: 'Получить Usera по ID <> Email <> FullName' })
  async findUserByParam(@Param('param') param: string) {
    return await this.usersService.findUserByParam(param);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление Пользователя' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление Пользователя' })
  async removeUser(@Param('id') id: string) {
    return await this.usersService.removeUser(+id);
  }
  // @Delete(':id')
  // @ApiOperation({ summary: 'Востановить Пользователя' })
  // restoreUser(@Param('id') id: string) {
  //   return await this.usersService.restoreUser(+id);
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
    console.log('u.cntrl ava fileId : ' + fileId);
    // ^^ дораб.чтоб м/у users/ и /avatar встал userId
    res.sendFile(fileId, { root: 'static/users/avatar' });
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
        avatar /* file */: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  // данн.выбора req swagger
  // @ApiQuery({
  //   name: 'fileType',
  //   enum: 'avatar',
  // })
  // свой перехват > сохр.ф.с нов.name
  @UseInterceptors(FileInterceptor('avatar', { storage: fileStorage }))
  async uploadAvatar(
    // вытяг.ф.из запроса
    @UploadedFile(
      // валид.
      new ParseFilePipe({
        validators: [
          // валид.разм.в bite. Здесь макс.3 Mb
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
          // валид.тип файлов. // ^^ дораб под разн.типы файлов
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    avatar /* file */ : Express.Multer.File,
    // user id ч/з @Param || @UserId
    /* @Param('userid') userId */ @UserId() userId: number,
  ) {
    // console.log('file : ', file);
    // console.log(file);
    console.log('avatar : ', avatar);
    console.log(avatar);
    // сохр./обнов. путь к аватару
    // this.usersService.setAvatar(
    //   Number(userId),
    //   `${this.SERVER_URL}${file.path}`,
    // );
    console.log('avatar.destination : ' + avatar.destination);
    let avatarUrl =
      /* this.SERVER_URL + */
      avatar.destination.replace(/^\.\/static\/users\//g, `users/${userId}/`);
    console.log('avatarUrl 1 : ' + avatarUrl);
    avatarUrl = avatarUrl.replace(/\/$/, '');
    console.log('avatarUrl 2 : ' + avatarUrl);
    this.usersService.setAvatar(userId, avatarUrl);
  }

  // @ApiOperation({ summary: 'Выдать роль' })
  // @ApiResponse({ status: 200 })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  // @Post('/role')
  // async addRole(@Body() dto: AddRoleDto) {
  //   return await this.usersService.addRole(dto);
  // }

  // @ApiOperation({ summary: 'Забанить пользователя' })
  // @ApiResponse({ status: 200 })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  // @Post('/ban')
  // async ban(@Body() dto: BanUserDto) {
  //   return await this.usersService.ban(dto);
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
  //   return await newUser;
  // }
  //  ----------------------------------------------------------------------------------
  // ~~ Для получения пользователя (user), его роли (role) и уровня (level) из таблиц users, roles и user_roles
  // @Post('/userId')
  // async getUserRoleAndLevel(@Query('userId') userId: number) {
  //   console.log('userId : ' + userId);
  //   const user = await this.usersService.getUserRoleAndLevel(userId);
  //   return await user;
  // }
}
