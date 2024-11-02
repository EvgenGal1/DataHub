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

import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { UserId } from '../../common/decorators/user-id.decorator';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Controller('/albums')
// групп.мтд.cntrl albums > swagger
@ApiTags('Альбомы')
// обёртка защиты JWT > swg
// @ApiBearerAuth()
export class AlbumController {
  constructor(
    // private readonly authService: AuthService,
    private readonly albumsService: AlbumsService,
    private readonly logger: LoggingWinston,
  ) {}

  // ^^ МТД.CRUD

  @Post()
  @ApiOperation({ summary: 'Создать Альбом' })
  async createAlbum(
    @Body() createAlbumDto: CreateAlbumDto,
    @UserId() userId: number,
  ) {
    this.logger.info(
      `req User.ID '${userId}' + Alb: '${JSON.stringify(createAlbumDto)}'`,
    );
    return this.albumsService.createAlbum(createAlbumDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Альбомы' })
  async findAllAlbum() {
    this.logger.info(`req << Alb All`);
    return this.albumsService.findAllAlbums();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Альбом' })
  async findOneAlbum(@Param('id') id: number) {
    this.logger.info(`req < Alb.ID '${id}'`);
    return this.albumsService.findOneAlbum(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Альбом' })
  async updateAlbum(
    @Param('id') id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    this.logger.info(`req # Alb.ID '${id}'`);
    return this.albumsService.updateAlbum(+id, updateAlbumDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Альбом' })
  async removeAlbum(@Param('id') id: number) {
    this.logger.info(`req - Alb.ID '${id}'`);
    return this.albumsService.removeAlbum(id);
  }

  // ^^ ДОП.МТД.

  // поиск по исполнителю // ~ верн. возвращ.один альбом
  // ! не раб. @Get('/:author') | '/author' | 'author' > отраб.мтд.@Get(':id')findOne
  // @Get('/album/:author_Name')
  // @Get('/album/author_Name/:Name')
  @Get('/author_Name/:Name')
  @ApiOperation({ summary: 'Поиск Альбома по Автору' })
  async searchByAuthor(
    /* @Param // возвращ.всё */ @Query('author') authorName: string,
  ) /* : Promise<Album[]> // надо ли тип.возврат. */ {
    this.logger.info(`req <? Alb.Author '${authorName}'`);
    return this.albumsService.searchByAuthor(authorName);
  }

  // поиск по назв.альбома // ~ не верн. возвращ.по мтд. Author все альбомы
  // @Get('/album/album_Name/:Name')
  @Get('/album_Name/:Name')
  // @Get('/:album_Name')
  @ApiOperation({ summary: 'Поиск Альбома по Названию' })
  async searchByAlbumName(@Query('album') albumName: string) {
    this.logger.info(`req <? Alb.Name '${albumName}'`);
    return this.albumsService.searchByAlbumName(albumName);
  }

  // кол-во Треков по Альбому
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
        this.logger.info(`req <= Track.count Alb.Name '${value}'`);
        return this.albumsService.getTrackCountByAlbumName(value);
      case 'id':
        this.logger.info(`req <= Track.count Alb.ID '${value}'`);
        return this.albumsService.getTrackCountByAlbumId(Number(value));
      // ^ Добавьте обработку других вариантов поиска по своим требованиям
      default:
        throw new Error('Неверный вариант поиска');
    }
  }

  // по параметрам Альбома. Универс.
  @Get('/album/:track-params')
  @ApiOperation({ summary: 'Получить Альбомы по параметрам' })
  @ApiQuery({
    name: 'field',
    enum: ['author', 'album', 'cover', 'year', 'genre', 'id'],
  })
  @ApiQuery({ name: 'value', required: true })
  @ApiResponse({ status: 200, type: AlbumEntity })
  async getAlbumByParams(
    @Query('field') field: string,
    @Query('value') value: string,
  ) /* : Promise<Album> */ {
    const props = {};
    props[field] = value;
    this.logger.info(`req <? Alb.Param '${value}'`);
    return this.albumsService.getAlbumByProps(props);
  }
}
