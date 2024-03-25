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
  NotFoundException,
  Query,
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

import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { UserId } from 'src/decorators/user-id.decorator';
import { fileStorage } from 'src/files/storage';
import { FileTypeValidationPipe } from './fileTypeValidation.pipe';

@Controller('tracks')
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

    private readonly trackService: TracksService,
  ) {}

  // декор.мршрт./мтд.созд.ф.с допами
  @Post(/* ':param' */)
  // swagger описание мтд.
  @ApiOperation({ summary: 'Добавить Трек, Обложку, Альбом' })
  // тип запроса`потребляет`для формы swagger
  @ApiConsumes('multipart/form-data')
  // схема передачи данн.> swagger
  @ApiBody({
    schema: {
      // array - неск.форм загр.ф., string - поле для строки, object - поле {} для парам.
      type: 'object',
      properties: {
        // загр.ч/з окно "Выберите файл"
        track: {
          type: 'string',
          format: 'binary',
        },
        cover: {
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
            genre: { type: 'string', example: 'Other #' },
            // ^^ продумать логику альбома ID | Названия
            // cover: { type: 'number', example: '' },
          },
        },
      },
    },
  })
  // свой перехватчик
  @UseInterceptors(
    // `Перехватчик файловых полей`. Загр.ф. - FileFieldsInterceptor(неск.разн.ф.) | FilesInterceptor(масс.ф.) | FileInterceptor (1 ф.) | AnyFilesInterceptor(любые ф.)
    FileFieldsInterceptor(
      // name - стр.содер.имя из HTML форм с файлом, maxCount - макс.кло-во ф.;
      [
        { name: 'track', maxCount: 10 },
        { name: 'cover', maxCount: 1 },
      ],
      // сохр. > store локального хранилища
      { storage: fileStorage },
    ),
  )
  async createTrackByParam(
    @Body() createTrackDto: CreateTrackDto,
    // декор.`Загруженные файлы`
    @UploadedFiles(
      // ^^ `Разобрать Тип Файла`(встроенная проверка/валид.файла) | можн.созд.отд.ф.настр. | ParseFilePipeBuilder спец.кл.состав./созд.валид.
      // `разбор файлового канала`. Распастранённые стандарт.валидации
      //   new ParseFilePipe({
      //     validators: [
      //       // валид.разм.в bite. Здесь макс.20 Mb
      //          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 30 }), // ! Validation failed (expected size is less than 31457280)
      //       // валид.тип файлов > аудио
      //          new FileTypeValidator({ fileType: /(wav|aiff|ape|flac|mp3|ogg)$/ }), // ! Validation failed (expected type is /(wav|.....
      //       new FileTypeValidator({ fileType: 'audio/mpeg', }),
      //     ],
      //   }),
      // кастом.валид.
      // new ParseFilePipeBuilder()
      //   .addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif|mp3|audio\/mpeg|audio|mpeg)$/, })
      //   .addMaxSizeValidator({ maxSize: 1000, })
      //   .addValidator(new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 30 }))
      //   .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, }),
      // валидация ч/з доп.файл fileTypeValidation.pipe.ts
      new FileTypeValidationPipe(),
    ) // масс.ф.
    audios: Record<string, Express.Multer.File[]>, // альтер.способы Array<Express.Multer.File[]>
    // авто.подтяг.id вкл.user
    @UserId() userId: number,
  ) {
    try {
      console.log(
        't.c. audios | userId | DTO : ',
        audios,
        '|',
        userId,
        '|',
        createTrackDto,
      );
      // перем.эл.в audios по услов. > загр.serv > обраб.данн. > возврат
      const keys = Object.keys(audios);
      if (keys.length === 1 && keys[0] === 'track') {
        // Обработка загрузки только трека
        return await this.trackService.createTrackByParam(audios, userId);
      } else {
        // Обработка загрузки трека с обложкой альбома
        return await this.trackService.createTrackByParam(
          audios,
          userId,
          createTrackDto,
        );
      }
    } catch (error) {
      console.log('t.cntrl.Param catch error : ', error);

      // перем.`отсоединить обещания` > удал.эл.
      const unlinkPromises = [];
      // перебор объ.audios, заполнение перем.> удал.неск.файлов при неудачн.загр.
      Object.values(audios).forEach((trackArray) => {
        trackArray.forEach((track) => {
          unlinkPromises.push(fs.promises.unlink(track.path));
        });
      });
      await Promise.all(unlinkPromises);

      // кастом.ошб. Данн.msg serv <<>> cntrl + ошб.с serv
      throw new NotFoundException(
        error.response.message +
          ' <<>> ' +
          'Ошибка сохранения данных в БД на контроле загрузки Трека',
        error.options.message,
      );
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

  @Delete(/* ':id' */)
  @ApiOperation({ summary: 'Удаление Трек/и' })
  deleteTrack(
    @Query('ids') ids: string,
    // @Param('ids') ids: string | number,
    @UserId() userId: number,
  ) {
    // передача ф.id ч/з запят.> удал. tracks?ids=1,2,4, под userId
    return this.trackService.deleteTrack(ids, userId);
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
