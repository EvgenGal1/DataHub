import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  MaxFileSizeValidator,
  ParseFilePipe,
  Query,
  // FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiOperation,
  ApiConsumes,
  // ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { FileType, fileTypesAllowed } from './entities/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesService } from './files.service';
import { fileStorage } from '../../services/storage/storage';
// import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Controller('/files')
//  групп.мтд.cntrl files swagger
@ApiTags('Файлы')
// оборач. f.cntrl в @UseGuard(JwtAuthGuard) для защищ.от Авториз. Откл.req е/и JWT Токен отсутств./просроч.
// @UseGuards(JwtAuthGuard)
// оборач. чтоб swagger знал что req на files защищены jwt Токеном
// @ApiBearerAuth()
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly logger: LoggingWinston,
  ) {}

  // декор.мршрт./мтд.созд.ф.
  @Post()
  // описание `операции`swagger
  @ApiOperation({ summary: 'Загрузить Файл' })
  // тип запроса`потребляет`для формы swagger
  @ApiConsumes('multipart/form-data')
  // настр.схемы передачи данн.swagger
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // загр.ч/з окно "Выберите файл"
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  // `используйте перехватчики` для раб.с ф
  @UseInterceptors(FileInterceptor('file', { storage: fileStorage }))
  async createFile(
    // вытяг.`загруженный файл` из запроса
    @UploadedFile(
      // `разбор файлового канала`
      new ParseFilePipe({
        // валидаторы
        validators: [
          // валид.разм.в bite. Здесь макс.30 Mb
          new MaxFileSizeValidator({ maxSize: 30 * 1024 * 1024 }),
          // валид.тип файлов. // ^^ дораб под разн.типы файлов
          // new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    this.logger.info(
      `req + File '${JSON.stringify(file)}' > User.ID '${userId}')`,
    );
    // использ.мтд.из serv. Пердача file ч/з Multer, userId ч/з UserId
    return this.filesService.createFileByParam(file, userId);
  }

  // декор.мршрт./мтд.созд.ф.с Параметрами
  @Post(':param')
  // описание мтд.swagger
  @ApiOperation({ summary: 'Загрузить Файл по Параметрам' })
  // тип запроса`потребляет`для формы swagger
  @ApiConsumes('multipart/form-data')
  // настр.схемы swagger
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
  // данн.выбора req swagger
  @ApiQuery({ name: 'fileType', enum: FileType })
  // перехват.для раб.с ф
  @UseInterceptors(FileInterceptor('file', { storage: fileStorage }))
  async createFileByParam(
    // вытяг.ф.из запроса
    @UploadedFile(
      // валид.
      new ParseFilePipe({
        validators: [
          // валид.разм.в bite. Здесь макс.30 Mb
          new MaxFileSizeValidator({ maxSize: 30 * 1024 * 1024 }),
          // валид.тип файлов. // ^^ дораб под разн.типы файлов
          // new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('fileType') fileType: FileType,
    @UserId() userId: number,
  ) {
    this.logger.info(
      `req + File '${JSON.stringify(file)}' по fileType '${JSON.stringify(fileType)}' > User.ID '${userId}', )`,
    );
    // использ.мтд.из serv. Пердача file ч/з Multer, выбран.типа FileType ч/з ApiQuery и userId ч/з UserId
    return this.filesService.createFileByParam(file, userId, fileType);
  }

  // получ.ф. Все/Тип. Обращ.к files, возвращ.масс.объ.
  @Get()
  @ApiOperation({ summary: 'Получить Файлы по Типам <> Все' })
  @ApiQuery({
    name: 'fileType',
    enum: fileTypesAllowed,
    isArray: true,
    required: false,
  })
  // возвращ.ф.опред.user и с опред.типом(декор.Query)
  async findAllFiles(
    @UserId() userId: number,
    @Query('fileType')
    fileType?: FileType | FileType[] | typeof fileTypesAllowed | string,
  ) {
    // опред.тип файла. // ! не оч.корр.лог при all + ещё, т.к. includes в ошб. all нельзя назначить параметру типа FileType
    const isAllFilesRequest =
      fileType === 'all' || !fileType; /* || fileType.includes('all') */
    // пустой/один/неск-ко типов
    const typeArray = Array.isArray(fileType)
      ? fileType
      : fileType
        ? [fileType]
        : [];
    this.logger.info(
      `req << Files ${isAllFilesRequest ? `'ALL'` : `'ILIKE' '${typeArray.join(', ')}'`} > User.ID '${userId}'`,
    );
    return this.filesService.findAllFiles(userId, typeArray);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Один Файл' })
  async findOneFile(@Param('id') id: number) {
    this.logger.info(`req < File.ID '${id}'`);
    return this.filesService.findOneFile(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Файл' })
  async updateFile(
    @Param('id') id: number,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    this.logger.info(
      `req # File '${JSON.stringify(updateFileDto)}' > User.ID '${id}'`,
    );
    return this.filesService.updateFile(+id, updateFileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Файл' })
  async removeFile(@Query('id') id: number, @UserId() userId: number) {
    // передача ф.id ч/з запят.> удал. file?ids=1,2,4,
    this.logger.info(`req - File '${id}' > User.ID '${id}'`);
    return this.filesService.removeFile(id, userId);
  }
}
