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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import * as fs from 'fs';

// БАЗЫ ДАННЫХ. localhost, supabase(cloude storage)
import { fileStorage } from '../files/storage';
import { createClient } from '@supabase/supabase-js';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateReactionDto } from '../reactions/dto/create-reaction.dto';
import { UserId } from '../common/decorators/user-id.decorator';
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

  // мтд.созд.ф.с допами. декор.мршрт.
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
      // { storage: fileStorage },
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
        't.c. cre audios | userId | DTO : ',
        audios,
        '|',
        userId,
        '|',
        createTrackDto,
      );

      //  ----------------------------------------------------------------------------------
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabasePort = process.env.SUPABASE_PORT;
      console.log(
        't.c. supabaseUrl supabasePort : ',
        supabaseUrl,
        '|',
        supabasePort,
      );
      const supabaseUrlPort = process.env.SUPABASE_URL_PORT;
      const supabaseKey = process.env.SUPABASE_KEY;
      const supabase = createClient(supabaseUrlPort, supabaseKey);
      console.log(
        't.c. supabaseUrlPort supabaseKey : ',
        supabaseUrlPort,
        '|',
        supabaseKey,
      );
      console.log('t.c. supabase : ', supabase);

      const trackFiles = audios.track[0];
      const coverFile = audios.cover[0];
      console.log(
        't.c. cre trackFiles coverFile : ',
        trackFiles,
        '|',
        coverFile,
      );

      // Загрузка трека в Supabase
      const { data: trackData, error: trackError } = await supabase.storage
        .from('tracks')
        .upload(trackFiles.originalname, trackFiles.buffer, {
          contentType: trackFiles.mimetype,
        });
      console.log('t.c. cre_SB trackData : ', trackData);
      if (trackError) {
        throw trackError;
      }

      // const { publicUrl: trackPublicURL } = supabase.storage
      const trackPublicURL = supabase.storage
        .from('tracks')
        .getPublicUrl(trackData.path);
      console.log('t.c. cre_SB trackPublicURL : ', trackPublicURL);

      // Загрузка обложки в Supabase
      const { data: coverData, error: coverError } = await supabase.storage
        .from('covers')
        .upload(coverFile.originalname, coverFile.buffer, {
          contentType: coverFile.mimetype,
        });
      console.log('t.c. cre_SB coverData : ', coverData);
      if (coverError) {
        throw coverError;
      }

      // Получение URL-адреса трека и обложки
      // const { publicUrl: trackUrl } = supabase.storage
      const trackUrl = supabase.storage
        .from('tracks')
        .getPublicUrl(trackData.path);
      console.log('t.c. cre_SB trackUrl : ', trackUrl);

      // const { publicUrl: coverUrl } = supabase.storage
      const coverUrl = supabase.storage
        .from('covers')
        .getPublicUrl(coverData.path);
      console.log('t.c. cre_SB coverUrl : ', coverUrl);

      // // Создание трека в базе данных с URL-адресами
      // return this.trackService.create({
      //   ...createTrackDto,
      //   track: trackUrl,
      //   cover: coverUrl,
      //   userId,
      // });
      //  ----------------------------------------------------------------------------------
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
        // ! ошб. -  Property 'response' does not exist on type 'unknown'
        // error.response.message +
        //   ' <<>> ' +
        'Ошибка сохранения данных в БД на контроле загрузки Трека',
        error /* .options.message */,
      );
    }
  }

  //  ----------------------------------------------------------------------------------
  // Используйте Supabase для загрузки файлов:
  async /* function */ uploadFile(file: File) {
    const supabaseUrlPort = process.env.SUPABASE_URL_PORT;
    const supabaseKey = process.env.SUPABASE_KEY;
    const supabase = createClient(supabaseUrlPort, supabaseKey);
    console.log('t.c. supabase : ', supabase);
    const { data, error } = await supabase.storage
      .from('your-bucket-name')
      .upload(file.name, file);
    console.log('t.c. SB_upd data error : ', data, error);
    if (error) {
      throw error;
    }

    return data;
  }
  //  ----------------------------------------------------------------------------------

  // получить все треки
  @Get()
  @ApiOperation({
    summary: 'Получить: все <> назв.трека <> автор + count | offset',
  })
  // уточнен.`запрос`
  @ApiQuery({ name: 'param', required: false })
  @ApiQuery({ name: 'count', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAllTracks(
    // кол-во возвращ.Треков, стр.отступ
    @Query('param') param?: number | string,
    @Query('count') count?: number,
    @Query('offset') offset?: number,
  ) {
    console.log(
      't.c. findAllTracks param count offset : ',
      param,
      count,
      offset,
    );
    const findAllTracks = await this.trackService.findAllTracks(
      /* count || null, offset || null */
      param === (undefined || null) ? null : param,
      count === (undefined || null) ? null : count,
      offset === (undefined || null) ? null : offset,
    );
    return findAllTracks;
  }

  // получ Трек по ID <> Названию <> Исполнителю
  // ! опять мешаются findOneTrack и searchTrack
  @Get(`:param`)
  @ApiOperation({ summary: 'Получить Трек по ID <> Названию <> Исполнителю' })
  // param получ.из param маршрута req
  async findOneTrack(@Param('param') param: string) {
    console.log('t.c. findOneTrack param : ', param);
    return await this.trackService.findOneTrack(param);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление трека !!! НЕ ДОРАБОТАН' })
  async updateTrack(
    @Param('id') id: ObjectId,
    @Body() updateTrackDto: UpdateTrackDto,
  ) {
    return await this.trackService.updateTrack(+id, updateTrackDto);
  }

  @Delete(/* ':ids' */)
  @ApiOperation({ summary: 'Удаление Трек/и' })
  async deleteTrack(
    @Query('ids') ids: string,
    // @Param('ids') ids: string | number,
    @UserId() userId: number,
  ) {
    // передача ф.id ч/з запят.> удал. tracks?ids=1,2,4, под userId
    return await this.trackService.deleteTrack(ids, userId);
  }

  // поиск
  // @Get('/search/:query')
  @Get('search/:search')
  @ApiOperation({ summary: 'Поиск' })
  async searchTrack(@Query('search') search: string) {
    console.log('t.c. searchTrack search : ', search);
    return await this.trackService.searchTrack(search);
  }

  // Добавить реакцию к Треку
  @Post('/reaction')
  @ApiOperation({ summary: 'Добавить реакцию к Треку' })
  async addReactionTrack(@Body() createReactionDto: CreateReactionDto) {
    return await this.trackService.addReactionTrack(createReactionDto);
  }

  // увелич.Прослушиваний
  @Post('/listen/:id')
  @ApiOperation({ summary: 'увеличение Прослушиваний' })
  async listenTrack(@Param('id') id: ObjectId) {
    return await this.trackService.listenTrack(id);
  }
}
