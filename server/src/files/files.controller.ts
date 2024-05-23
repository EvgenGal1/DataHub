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

// import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileType, fileTypesAllowed } from './entities/file.entity';
import { FilesService } from './files.service';
import { fileStorage } from './storage';
// import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UserId } from '../common/decorators/user-id.decorator';

@Controller('files')
//  групп.мтд.cntrl files swagger
@ApiTags('files')
// оборач. f.cntrl в @UseGuard(JwtAuthGuard) для защищ.от Авториз. Откл.req е/и JWT Токен отсутств./просроч.
// @UseGuards(JwtAuthGuard)
// оборач. чтоб swagger знал что req на files защищены jwt Токеном
// @ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // декор.мршрт./мтд.созд.ф.
  @Post()
  // описание `операции`swagger
  @ApiOperation({ summary: 'Добавить Файл' })
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
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 30 }),
          // валид.тип файлов. // ^^ дораб под разн.типы файлов
          // new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    console.log('f.CNTRL file | userId : ', file, '|', userId);
    // использ.мтд.из serv. Пердача file ч/з Multer, userId ч/з UserId
    return await this.filesService.createFileByParam(file, userId);
  }

  // декор.мршрт./мтд.созд.ф.с Параметрами
  @Post(':param')
  // описание мтд.swagger
  @ApiOperation({ summary: 'Добавить Файл по Параметрам' })
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
  @ApiQuery({
    name: 'fileType',
    enum: FileType,
  })
  // перехват.для раб.с ф
  @UseInterceptors(FileInterceptor('file', { storage: fileStorage }))
  async createFileByParam(
    // вытяг.ф.из запроса
    @UploadedFile(
      // валид.
      new ParseFilePipe({
        validators: [
          // валид.разм.в bite. Здесь макс.30 Mb
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 30 }),
          // валид.тип файлов. // ^^ дораб под разн.типы файлов
          // new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('fileType') fileType: FileType,
    @UserId() userId: number,
  ) {
    console.log(
      'f.CNTRL file | fileType | userId : ',
      file,
      '|',
      fileType,
      '|',
      userId,
    );
    // использ.мтд.из serv. Пердача file ч/з Multer, выбран.типа FileType ч/з ApiQuery и userId ч/з UserId
    return await this.filesService.createFileByParam(file, userId, fileType);
  }

  // получ.ф. Все/Тип. Обращ.к files, возвращ.масс.объ.
  @Get()
  @ApiOperation({ summary: 'Получить Файлы по Типам <> Все' })
  @ApiQuery({
    name: 'fileType',
    enum: fileTypesAllowed,
    isArray: true,
  })
  // возвращ.ф.опред.user и с опред.типом(декор.Query)
  async findAllFiles(
    @UserId() userId: number,
    @Query('fileType') fileType: FileType | FileType[],
  ) {
    if (!Array.isArray(fileType)) fileType = [fileType];
    return await this.filesService.findAllFiles(userId, fileType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Один Файл' })
  async findOneFile(@Param('id') id: string) {
    return await this.filesService.findOneFile(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить Один Файл' })
  async updateFile(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return await this.filesService.updateFile(+id, updateFileDto);
  }

  @Delete(/* ':id' */)
  @ApiOperation({ summary: 'Удалить Файлы' })
  async removeFile(@Query('ids') ids: string, @UserId() userId: number) {
    // передача ф.id ч/з запят.> удал. file?ids=1,2,4,
    return await this.filesService.removeFile(ids, userId);
  }
}
