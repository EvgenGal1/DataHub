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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  /* ApiBearerAuth, */ ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

// import { CreateFileDto } from './dto/create-file.dto';
// import { UpdateFileDto } from './dto/update-file.dto';
import { FileType } from './entities/file.entity';
import { FilesService } from './files.service';
import { fileStorage } from './storage';
// import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { UpdateFileDto } from './dto/update-file.dto';

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
  @ApiOperation({ summary: 'Добавить Трек' })
  // перехват.для раб.с ф
  @UseInterceptors(FileInterceptor('file', { storage: fileStorage }))
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
  createFile(
    // вытяг.ф.из запроса
    @UploadedFile(
      // валид.разм.в bite. Здесь макс.3 Mb
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 })],
      }),
    )
    file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    // return file;
    // использ.мтд.из serv. Пердача file ч/з Multer и userId ч/з UserId
    return this.filesService.createFile(file, userId);
  }

  // мтд.для получ.всех ф.списком.масс. Обращ.к files, возвращ.масс.всех ф. При получ.запроса обращ.к serv берём мтд.findAll который обращ.к БД, резулт.данн.fn вернёт в ответ на данн.запрос
  @Get()
  @ApiOperation({ summary: 'Получить Все файлы' })
  // возвращ.ф.опред.user и с опред.типом(декор.Query)
  findAllFiles(@UserId() userId: number, @Query('type') fileType: FileType) {
    return this.filesService.findAllFiles(userId, fileType);
  }

  @Get(':id')
  findOneFile(@Param('id') id: string) {
    return this.filesService.findOneFile(+id);
  }

  @Patch(':id')
  updateFile(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.updateFile(+id, updateFileDto);
  }

  @Delete(':id')
  removeFile(@UserId() userId: number, @Query('ids') ids: string) {
    // передача ф.id ч/з запят.> удал. file?ids=1,2,4,
    return this.filesService.removeFile(userId, ids);
  }
}
