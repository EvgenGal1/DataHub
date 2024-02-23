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
import {
  /* ApiBearerAuth, */ ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';

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
  createAlbum(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumsService.createAlbum(createAlbumDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Альбомы' })
  findAllAlbum() {
    return this.albumsService.findAllAlbums();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Альбом' })
  findOneAlbum(@Param('id') id: string) {
    return this.albumsService.findOneAlbum(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Альбом' })
  updateAlbum(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    return this.albumsService.updateAlbum(+id, updateAlbumDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Альбом/ы' })
  removeAlbum(@Param('id') id: string) {
    return this.albumsService.removeAlbum(+id);
  }

  // ^^ ДОП.МТД.
  // поиск по исполнителю
  @Get('/author_Name/:Name')
  @ApiOperation({ summary: 'Поиск Альбома по Автору' })
  searchByAuthor(@Query('author') authorName: string) {
    return this.albumsService.searchByAuthor(authorName);
  }

  @Get('/album_Name/:Name')
  @ApiOperation({ summary: 'Поиск Альбома по Названию' })
  searchByAlbumName(@Query('album') albumName: string) {
    return this.albumsService.searchByAlbumName(albumName);
  }

  // кол-во по Альбому
  @Get('/album/:track-count')
  @ApiOperation({ summary: 'Получить количество по Альбому' })
  @ApiQuery({
    name: 'searchBy',
    enum: ['название', 'id', 'стиль', 'год выпуска', 'общая длительность'],
  })
  async getTrackCount(
    @Query('searchBy') searchBy: string,
    @Query('value') value: string,
  ): Promise<number> {
    switch (searchBy) {
      case 'название':
        return this.albumsService.getTrackCountByAlbumName(value);
      case 'id':
        return this.albumsService.getTrackCountByAlbumId(Number(value));
      // ^ Добавить обработку других вариантов поиска по своим требованиям
      default:
        throw new Error('Неверный вариант поиска');
    }
  }

  // по параметрам Альбома. Универс.
  @Get('/album/:track-params')
  @ApiOperation({ summary: 'Получить Альбомы по параметрам' })
  @ApiQuery({
    name: 'field',
    enum: ['author', 'album', 'cover', 'year', 'style', 'id'],
  })
  @ApiQuery({ name: 'value', required: true })
  @ApiResponse({ status: 200, type: AlbumEntity })
  async getAlbumByParams(
    @Query('field') field: string,
    @Query('value') value: string,
  ) /* : Promise<Album> */ {
    const props = {};
    props[field] = value;
    return this.albumsService.getAlbumByProps(props);
  }
}
