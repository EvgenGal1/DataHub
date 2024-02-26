/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'typeorm';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  // Query,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  /* ApiBearerAuth, */
  ApiOperation,
  ApiCreatedResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import * as fs from 'fs';

import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { UserId } from 'src/decorators/user-id.decorator';
import { fileStorage } from 'src/files/storage';

@Controller('/tracks')
// групп.мтд.cntrl tracks > swagger
@ApiTags('tracks')
// сообщ.о защищены req jwt Токеном > swagger
// @ApiBearerAuth()
export class TrackController {
  constructor(
    // ~ пробы валибации в разн.файлах
    // ! ошб.в ParseFilePipe({validators[{validator}]}) - "validator" не существует в типе "FileValidator<Record<string
    // private readonly imageValidator: ImageValidator,
    // private readonly audioValidator: AudioValidator,

    private readonly trackService: TrackService,
  ) {}

  // созд.Трек
  @Post()
  // swagger описание мтд.
  @ApiOperation({ summary: 'Добавить Трек' })
  // свой перехватчик
  @UseInterceptors(
    // `Перехватчик файловых полей`. Загр.ф. - FileFieldsInterceptor(неск.разн.ф.) | FilesInterceptor(масс.ф.) | FileInterceptor (1 ф.) | AnyFilesInterceptor(любые ф.)
    FileFieldsInterceptor(
      // name - стр.содер.имя из HTML форм с файлом, maxCount - макс.кло-во ф.;
      [
        { name: 'album', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
      ],
      // сохр. > store локального хранилища
      { storage: fileStorage },
    ),
  )
  // тип запроса > swagger
  @ApiConsumes('multipart/form-data')
  // схема передачи данн.> swagger
  @ApiBody({
    schema: {
      // array - неск.форм загр.ф., string - поле для строки, object - поле {} для парам.
      type: 'object',
      properties: {
        // загр.ч/з окно "Выберите файл"
        album: {
          type: 'string',
          format: 'binary',
        },
        audio: {
          type: 'string',
          format: 'binary',
        },
        // picture: { type: 'array', items: { type: 'string', format: 'binary' },} - загр.неск.ф.в кажд.поле
        createTrackDto: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Название трк.#' },
            artist: { type: 'string', example: 'Артист #' },
            text: { type: 'string', example: 'Текст #' },
            style: { type: 'string', example: 'Other #' },
            // ^^ продумать логику альбома ID | Названия
            album: { type: 'string', example: 'Альбом #' },
          },
        },
      },
    },
  })
  async createTrack(
    @Body() createTrackDto: CreateTrackDto,
    // декор.`Загруженные файлы`
    @UploadedFiles(
      // `Разобрать Тип Файла`(встроенная проверка/валид.файла) | можн.созд.отд.ф.настр. | ParseFilePipeBuilder спец.кл.состав./созд.валид.
      new ParseFilePipe({
        validators: [
          // валид.разм.в bite. Здесь макс.20 Mb // ! Validation failed (expected size is less than 20971520) размер меньше 20Mb
          // new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 20 }),
          // валид.тип файлов
          // new FileTypeValidator({ fileType: /(wav|aiff|ape|flac|mp3|ogg)$/ }),
          // ~ пробы валибации в разн.файлах
          // настр.в отдел.ф.
          // ! ошб. - Объектный литерал может использовать только известные свойства. "validator" не существует в типе "FileValidator<Record<string, any>,
          // {
          //   validator: this.imageValidator.validate,
          //   field: 'image',
          //   maxCount: 1,
          // },
          // {
          //   validator: this.audioValidator.validate,
          //   field: 'audio',
          //   maxCount: 1,
          // },
        ],
      }),
    )
    files: Record<string, Express.Multer.File[]>,
    // files,
    /* : {
      picture?: Express.Multer.File; // [] // е/и неск.ф.
      audio?: Express.Multer.File; // [] // е/и неск.ф.
    } */ // filess: Record<string, Express.Multer.File[]>,
    // files: Express.Multer.File,
    // /* из док.настр. */ files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] },
    // авто.подтяг.id вкл.user
    @UserId() userId: number,
  ) {
    // ~
    console.log('track.CNTRL 0 : ' + 0);
    console.log(
      'track.CNTRL DTO | files | userId : ',
      createTrackDto,
      '|',
      files,
      '|',
      userId,
    );
    try {
      // Доступ к загруженным файлам
      // const { picture, audio } = files;

      // обраб.ф. и передача в serv
      return this.trackService.createTrack(createTrackDto, files, userId);
    } catch (error) {
      console.log('catch 0 : ' + 0);
      // Удаление файла при неудачной загрузке данных в БД
      // await fs.promises.unlink(files.path);
      // throw new Error('Ошибка сохранения данных в базе данных');
      //
      // удал.неск.файлв при неудачн.загр.
      const unlinkPromises = [];

      for (const fieldName of Object.keys(files)) {
        console.log('fieldName : ', fieldName);
        for (const file of files[fieldName]) {
          console.log('file : ', file);
          unlinkPromises.push(fs.promises.unlink(file.path));
        }
      }

      await Promise.all(unlinkPromises);
      throw new Error('Ошибка сохранения данных в базе данных');
    }
  }

  // получить все треки
  @Get()
  @ApiOperation({ summary: 'Получить все' })
  findAllTracks(/* @Query('count') count: number, @Query('offset') offset: number */) {
    return this.trackService.findAllTracks(/* count, offset */);
  }

  // получ Трек по ID <> Названию <> Исполнителю
  @Get(/* `:id` */ ':param')
  @ApiOperation({ summary: 'Получить Трек по ID <> Названию <> Исполнителю' })
  // param получ.из param маршрута req
  findTrackByParam(@Param('param') param: string /* ObjectId */) {
    return this.trackService.findTrackByParam(param /* +id */);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление трека !!! НЕ ДОРАБОТАН' })
  updateTrack(
    @Param('id') id: ObjectId,
    @Body() updateTrackDto: UpdateTrackDto,
  ) {
    return this.trackService.updateTrack(+id, updateTrackDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление трека' })
  deleteTrack(@Param('id') id: ObjectId) {
    return this.trackService.deleteTrack(+id);
  }

  // @Get('/search')
  // @ApiOperation({ summary: 'Поиск' })
  // search(@Query('query') query: string) {
  //   return this.trackService.search(query);
  // }

  @Post('/reaction')
  @ApiOperation({ summary: 'Добавить реакцию к треку' })
  addReaction(@Body() createReactionDto: CreateReactionDto) {
    return this.trackService.addReaction(createReactionDto);
  }

  // @Post('/listen/:id')
  // @ApiOperation({ summary: 'Прослушиваний' })
  // listen(@Param('id') id: ObjectId) {
  //   return this.trackService.listen(id);
  // }
}
