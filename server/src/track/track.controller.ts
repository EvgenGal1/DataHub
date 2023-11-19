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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  /* ApiBearerAuth, */
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('/tracks')
// групп.мтд.cntrl tracks > swagger
@ApiTags('tracks')
// сообщ.о защищены req jwt Токеном > swagger
// @ApiBearerAuth()
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  // создать/добавить один трек
  @Post()
  // swagger описание мтд.
  @ApiOperation({ summary: 'Добавить Трек' })
  // свой перехватчик
  @UseInterceptors(
    // name - стр.содер.имя из HTML форм с файлом, maxCount - макс.кло-во ф.; FileFieldsInterceptor(наск.разн.ф.) | FilesInterceptor(масс.ф.) | FileInterceptor (1 ф.)
    FileFieldsInterceptor([
      { name: 'picture', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  create(
    @UploadedFiles(
      // `Разобрать Тип Файла`(встроенная проверка/валид.файла) | можн.созд.отд.ф.настр. | ParseFilePipeBuilder спец.кл.состав./созд.валид.
      new ParseFilePipe({
        validators: [
          // валид.разм.в bite. Здесь макс.3 Mb
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 3 }),
          // валид.тип файлов
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    files: Express.Multer.File,
    // /* из док.настр. */ files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] },
    @Body() createTrackDto: CreateTrackDto,
  ) {
    // const {picture, audio} = files
    return this.trackService.create(
      createTrackDto /* , picture[0], audio[0] */,
    );
  }

  // получить все треки
  @Get()
  @ApiOperation({ summary: 'Получить все' })
  findAll(/* @Query('count') count: number, @Query('offset') offset: number */) {
    return this.trackService.findAll(/* count, offset */);
  }

  // получ один по id
  // ! первые не отраж.в swgg и нет окна выбора id как в findById
  @Get(':id')
  // id получ.из param маршрута req
  findOne(@Param('id') id: ObjectId) {
    return this.trackService.findOne(+id);
  }
  // получ один по id ч/з findById
  @Get(':id')
  @ApiOperation({ summary: 'Получить ч/з findById' })
  @ApiCreatedResponse({ description: 'Описание findById' })
  findById(@Param('id') id: string) {
    return this.trackService.findById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление трека !!! НЕ ДОРАБОТАН' })
  update(@Param('id') id: ObjectId, @Body() updateTrackDto: UpdateTrackDto) {
    return this.trackService.update(+id, updateTrackDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление трека' })
  delete(@Param('id') id: ObjectId) {
    return this.trackService.delete(+id);
  }

  // @Get('/search')
  // @ApiOperation({ summary: 'Поиск' })
  // search(@Query('query') query: string) {
  //   return this.trackService.search(query);
  // }

  @Post('/comment')
  @ApiOperation({ summary: 'Добавить комментария к треку' })
  addComment(@Body() createCommentDto: CreateCommentDto) {
    return this.trackService.addComment(createCommentDto);
  }

  // @Post('/listen/:id')
  // @ApiOperation({ summary: 'Прослушиваний' })
  // listen(@Param('id') id: ObjectId) {
  //   return this.trackService.listen(id);
  // }
}
