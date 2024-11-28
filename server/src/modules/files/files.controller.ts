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
  ApiParam,
} from '@nestjs/swagger';

// Сервисы/DTO
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
// import { JwtAuthGuard } from '../auth/guard/jwt.guard';
// декор.получ. User.ID
import { UserId } from '../../common/decorators/user-id.decorator';
// локал.ф.хран-ще
import { fileStorage } from '../../services/storage/storage';
// утилиты Общие
import { BasicUtils } from 'src/common/utils/basic.utils';
// типы/пути файлов
import { FilePaths } from '../../common/types/typeFilePaths';
// логгирование LH
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
    private readonly basicUtils: BasicUtils,
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
    // логгирование в LH
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
  @ApiQuery({ name: 'filePaths', enum: FilePaths })
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
    @Query('filePaths') filePaths: FilePaths,
    @UserId() userId: number,
  ) {
    this.logger.info(
      `req + File '${JSON.stringify(file)}' по filePaths '${JSON.stringify(filePaths)}' > User.ID '${userId}', )`,
    );
    // использ.мтд.из serv. Пердача file ч/з Multer, выбран.типа FilePaths ч/з ApiQuery и userId ч/з UserId
    return this.filesService.createFileByParam(file, userId, filePaths);
  }

  // получ.ф. Все/Тип. Обращ.к files, возвращ.масс.объ.
  @Get()
  @ApiOperation({
    summary: 'Получить Файлы: Все <> Парам/Тип/user <> count/offset',
  })
  // уточнен.`запрос`
  // параметры выбора: цель/значения
  @ApiQuery({
    name: 'paramTarget',
    enum: ['fileName', 'size', 'mimeType', 'user'],
    required: false,
  })
  @ApiQuery({ name: 'paramValue', required: false })
  // кол-во/смещение
  @ApiQuery({ name: 'count', required: false })
  @ApiQuery({ name: 'offset', required: false })
  // гр.файлов (п.назначения)
  @ApiQuery({
    name: 'filePaths',
    enum: FilePaths,
    isArray: true,
    required: false,
  })
  // возвращ.ф.опред.user и с опред.типом(декор.Query)
  async findAllFiles(
    // параметры выбора: цель/значения
    @Query('paramTarget') paramTarget?: string,
    @Query('paramValue') paramValue?: string,
    // кол-во/смещение
    @Query('count') count?: number,
    @Query('offset') offset?: number,
    // пути хранения ф.
    @Query('filePaths') filePaths?: FilePaths | FilePaths[],
  ) {
    // объ./объедин.парам.
    const paramTargetValue = {};
    if (paramTarget && paramValue) paramTargetValue[paramTarget] = paramValue;

    // опред.тип файла.
    const isAllFilesRequest = FilePaths.ALL || !filePaths;
    // пустой/один/неск-ко типов
    const filePathsArray = Array.isArray(filePaths)
      ? filePaths
      : filePaths
        ? [filePaths]
        : [];
    this.logger.info(
      `req << Files ${isAllFilesRequest ? `'ALL'` : `'ILIKE' '${filePathsArray.join(', ')}'`}'`,
    );
    return this.filesService.findAllFiles(
      paramTargetValue,
      count,
      offset,
      filePathsArray,
    );
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

  @Delete(':ids')
  @ApiOperation({ summary: 'Удалить Файл/ы по IDs' })
  @ApiParam({
    name: 'ids',
    required: true,
    description: 'IDs Файла/ов ч/з запятые',
    type: String,
  })
  @ApiQuery({
    name: 'hardDelete',
    required: false,
    description: 'Флаг полного Удаления',
    type: Boolean,
  })
  async deleteFiles(
    @Param('ids') idsString: string,
    @Query('hardDelete') hardDelete: boolean,
    @UserId() userId: number,
  ) {
    // разбир. IDs из стр.
    const ids = await this.basicUtils.parseIdsFromString(idsString);
    this.logger.debug(
      `req - Files.IDs '${ids}' ${hardDelete ? 'HardDel' : ''} от User.ID '${userId}'`,
    );
    return this.filesService.deleteFiles(ids, userId, hardDelete);
  }
}
