import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
// import { ObjectId } from 'typeorm';
import { /* ApiBearerAuth, */ ApiOperation, ApiTags } from '@nestjs/swagger';

import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Controller('/albums')
// групп.мтд.cntrl tracks > swagger
@ApiTags('albums')
// сообщ.о защищены req jwt Токеном > swagger
// @ApiBearerAuth()
export class AlbumController {
  constructor(private readonly albumsService: AlbumService) {}

  // ^^ МТД.CRUD
  @Post()
  @ApiOperation({ summary: 'Создать Альбом' })
  create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumsService.create(createAlbumDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Альбомы' })
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Альбом' })
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Альбом' })
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    return this.albumsService.update(+id, updateAlbumDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Альбом/ы' })
  remove(@Param('id') id: string) {
    return this.albumsService.remove(+id);
  }

  // ^^ ДОП.МТД.
  // поиск по исполнителю
  // ! не раб. @Get('/:author') | '/author' | 'author' > отраб.мтд.@Get(':id')findOne
  @Get('/album/:author_Name')
  @ApiOperation({ summary: 'Поиск Альбома по Автору' })
  searchByAuthor(
    /* @Param // возвращ.всё */ @Query('author') authorName: string,
  ) /* : Promise<Album[]> // надо ли тип.возврат. */ {
    return this.albumsService.searchByAuthor(authorName);
  }

  // поиск по назв.альбома
  @Get('/album/:album_Name')
  @ApiOperation({ summary: 'Поиск Альбома по Названию' })
  searchByAlbumName(@Query('album') albumName: string) {
    return this.albumsService.searchByAlbumName(albumName);
  }
}
