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
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
  // ApiBearerAuth,
  // ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

// Сервисы/DTO
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddingRolesToUsersDto } from '../roles/dto/add-roles-to-users.dto';
// декор.получ. User.ID
import { UserId } from '../../common/decorators/user-id.decorator';
// локал.ф.хран-ще
import { fileStorage } from '../../services/storage/storage';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';
// JWT защита маршрутов
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('/users')
// групп.мтд.cntrl users > swagger
@ApiTags('Пользователи')
// обёртка защиты JWT > swg
// @ApiBearerAuth()
export class UsersController {
  // ч/з внедр.завис. + UsersService > раб.ч/з this с serv.users
  constructor(
    private readonly usersService: UsersService,
    // логгер
    private readonly logger: LoggingWinston,
  ) {}

  // ^^ МТД.CRUD

  @Post()
  // описание `операции`swagger
  @ApiOperation({ summary: 'Создать Пользователя' })
  // декор.res.swagger: ApiResponse, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse
  // @ApiResponse({
  //   status: 201,
  //   type: UserEntity,
  //   description: 'Ответ о создании Пользователя',
  // })//
  @UsePipes(new ValidationPipe())
  // получ.объ из запроса ч/з @Body
  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.debug(`req + User DTO : '${JSON.stringify(createUserDto)}'`);
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Всех Пользователей' })
  // @Roles('ADMIN')
  // оборач.в`охранник`(как MW) > защищ.Авториз.
  @UseGuards(JwtAuthGuard)
  // оборач.swg > защищены jwt Токеном
  @ApiBearerAuth()
  async findAllUsers() {
    this.logger.debug(`req << Users All`);
    return this.usersService.findAllUsers();
  }

  // ОДИН user.по id
  @Get(':id')
  @ApiOperation({ summary: 'Получить Пользователя' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOneUser(@Param('id') id: number) {
    this.logger.debug(`req < User.ID '${id}'`);
    return this.usersService.findOneUser(+id);
  }

  // ОДИН user.по параметрам ID <> Email <> FullName
  @Get('param/:param')
  @ApiOperation({ summary: 'Получить Usera по ID <> Email <> FullName' })
  async findUserByParam(@Param('param') param: string) {
    this.logger.debug(`req <? User Param '${param}'`);
    return this.usersService.findUserByParam(param);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Пользователя' })
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.debug(`req # User.ID '${id}'`);
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Пользователя' })
  async removeUser(@Param('id') id: number) {
    this.logger.debug(`req - User.ID '${id}'`);
    return this.usersService.removeUser(id);
  }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Востановить Пользователя' })
  // restoreUser(@Param('id') id: number) {
  //   return  this.usersService.restoreUser(+id);
  // }

  // ^^ мтд.> ADMIN ----------------------------------------------------------------------------------
  // добавить неск.Ролей к неск.Пользователям
  @Post('admin/addRolesToUsers')
  @ApiOperation({ summary: 'Добавить Роли к Пользователям' })
  async createUserRoles(
    @Body() addingRolesToUsersDto: AddingRolesToUsersDto,
  ): Promise<void> {
    this.logger.debug(
      `req + Role в User DTO : '${JSON.stringify(addingRolesToUsersDto)}'`,
    );
    this.usersService.addingRolesToUsers(addingRolesToUsersDto);
  }

  // ^^ Расшир.мтд. ----------------------------------------------------------------------------
  // !! https://www.techiediaries.com/nestjs-upload-serve-static-file/

  // получ.аватар Пользователя. Раб.со статич.ф.
  @Get(':userid/avatar/:fileId')
  @ApiOperation({ summary: 'Открыть Аватар' })
  // из @`парам` взять id ф., возврат ответа
  async serveAvatar(@Param('fileId') fileId: number, @Res() res): Promise<any> {
    this.logger.debug(`req <? Ava User.fileId: '${fileId}'`);
    // ^^ дораб.чтоб м/у users/ и /avatar встал userId
    res.sendFile(fileId, { root: 'static/users/avatar' });
  }

  // загр.аватар Пользователя
  @Post(':useridd/avatar')
  @ApiOperation({ summary: 'Добавить Аватар' })
  @ApiConsumes('multipart/form-data')
  // окно загр.ф.
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
    avatar: Express.Multer.File,
    @Query('avatarId') avatarId: number,
    @UserId() userId: number,
  ) {
    this.logger.debug(
      `req + AVA '${avatar.originalname}' в Ava.ID '${avatarId}' > User.ID '${userId}'`,
    );
    this.usersService.setAvatar(userId, avatarId, avatar);
  }

  // @ApiOperation({ summary: 'Выдать роль' })
  // @ApiResponse({ status: 200 })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  // @Post('/role')
  // async addRole(@Body() dto: AddRoleDto) {
  //   return this.usersService.addRole(dto);
  // }

  // @ApiOperation({ summary: 'Забанить пользователя' })
  // @ApiResponse({ status: 200 })
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  // @Post('/ban')
  // async ban(@Body() dto: BanUserDto) {
  //   return this.usersService.ban(dto);
  // }

  // ~~ связь с конкретными ролями
  // @Post()
  // async createUserWithRoles(
  //   @Body('username') username: string,
  //   @Body('roles') roles: string[],
  // ) {
  //   const newUser = this.usersService.createUserWithRoles(
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
  //   const user = this.usersService.getUserRoleAndLevel(userId);
  //   return user;
  // }
}
