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
// import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { UserId } from 'src/decorators/user-id.decorator';

@Controller('files')
//  групп.мтд.cntrl files swagger
@ApiTags('files')
// оборач. f.cntrl в @UseGuard(JwtAuthGuard) для защищ.от Авториз. Откл.req е/и JWT Токен отсутств./просроч.
// @UseGuards(JwtAuthGuard)
// оборач. чтоб swagger знал что req на files защищены jwt Токеном
// @ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // мтд.создания ф.
  @Post()
  // описание мтд.swagger
  @ApiOperation({ summary: 'Добавить Файл' })
  // тип запроса swagger
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
  createFile(
    // вытяг.ф.из запроса
    @UploadedFile(
      // валид.
      new ParseFilePipe({
        validators: [
          // валид.разм.в bite. Здесь макс.3 Mb
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
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
    return this.filesService.createFile(file, fileType, userId);
  }

  // мтд.для получ.всех ф.списком.масс. Обращ.к files, возвращ.масс.всех ф. При получ.запроса обращ.к serv берём мтд.findAll который обращ.к БД, резулт.данн.fn вернёт в ответ на данн.запрос
  @Get()
  @ApiOperation({ summary: 'Получить Файлы по Типам <> Все' })
  @ApiQuery({
    name: 'fileType',
    enum: fileTypesAllowed,
    isArray: true,
  })
  // возвращ.ф.опред.user и с опред.типом(декор.Query)
  findAllFiles(
    @UserId() userId: number,
    @Query('fileType') fileType: FileType | FileType[],
  ) {
    if (!Array.isArray(fileType)) fileType = [fileType];
    return this.filesService.findAllFiles(userId, fileType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Один Файл' })
  findOneFile(@Param('id') id: string) {
    return this.filesService.findOneFile(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить Один Файл' })
  updateFile(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.updateFile(+id, updateFileDto);
  }

  @Delete(/* ':id' */)
  @ApiOperation({ summary: 'Удалить Файлы' })
  removeFile(@UserId() userId: number, @Query('ids') ids: string) {
    // передача ф.id ч/з запят.> удал. file?ids=1,2,4,
    return this.filesService.removeFile(userId, ids);
  }
}
