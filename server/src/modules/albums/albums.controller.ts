/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  /* ApiBearerAuth, */ ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Logger } from 'winston';

import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { UserId } from '../../common/decorators/user-id.decorator';

@Controller('/albums')
// групп.мтд.cntrl tracks > swagger
@ApiTags('albums')
// сообщ.о защищены req jwt Токеном > swagger
// @ApiBearerAuth()
export class AlbumController {
  constructor(
    @Inject('WINSTON_LOGGER') private readonly logger: Logger,
    // private readonly authService: AuthService,
    private readonly albumsService: AlbumsService,
  ) {}

  // ^^ МТД.CRUD

  @Post()
  @ApiOperation({ summary: 'Создать Альбом' })
  async createAlbum(
    @Body() createAlbumDto: CreateAlbumDto,
    @UserId() userId: number,
  ) {
    try {
      this.logger.info(`req + Alb ID: ${userId}`);
      return await this.albumsService.createAlbum(createAlbumDto, userId);
    } catch (error) {
      throw new HttpException(
        'Ошибка при создании Альбома',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Альбомы' })
  async findAllAlbum() {
    try {
      this.logger.info(`req < Alb All`);
      return this.albumsService.findAllAlbums();
    } catch (error) {
      throw new HttpException(
        'Ошибка Получить Все Альбомы',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Альбом' })
  async findOneAlbum(@Param('id') id: string) {
    try {
      this.logger.info(`req < Alb ID ${id}`);
      return this.albumsService.findOneAlbum(+id);
    } catch (error) {
      throw new HttpException(
        'Ошибка Получить Альбом',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Альбом' })
  async updateAlbum(
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    try {
      this.logger.info(`req # Alb ID ${id}`);
      return this.albumsService.updateAlbum(+id, updateAlbumDto);
    } catch (error) {
      throw new HttpException(
        'Ошибка Обновить Альбом',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Альбом/ы' })
  async removeAlbum(@Param('id') id: string) {
    try {
      this.logger.info(`req - Alb ID ${id}`);
      return this.albumsService.removeAlbum(+id);
    } catch (error) {
      throw new HttpException(
        'Ошибка Удалить Альбом',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    try {
      this.logger.info(`req < Alb.Author ${authorName}`);
      return this.albumsService.searchByAuthor(authorName);
    } catch (error) {
      throw new HttpException(
        'Ошибка Поиск Альбома по Автору',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // поиск по назв.альбома // ~ не верн. возвращ.по мтд. Author все альбомы
  // @Get('/album/album_Name/:Name')
  @Get('/album_Name/:Name')
  // @Get('/:album_Name')
  @ApiOperation({ summary: 'Поиск Альбома по Названию' })
  async searchByAlbumName(@Query('album') albumName: string) {
    try {
      this.logger.info(`req < Alb.Name ${albumName}`);
      return this.albumsService.searchByAlbumName(albumName);
    } catch (error) {
      throw new HttpException(
        'Ошибка Поиск Альбома по Названию',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    try {
      switch (searchBy) {
        case 'название':
          this.logger.info(`req < Track.count Alb.Name ${value}`);
          return this.albumsService.getTrackCountByAlbumName(value);
        case 'id':
          this.logger.info(`req < Track.count Alb.ID ${value}`);
          return this.albumsService.getTrackCountByAlbumId(Number(value));
        // ^ Добавьте обработку других вариантов поиска по своим требованиям
        default:
          throw new Error('Неверный вариант поиска');
      }
    } catch (error) {
      throw new HttpException(
        'Ошибка Удалить Альбом',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    try {
      const props = {};
      props[field] = value;
      this.logger.info(`req < Alb.Param ${value}`);
      return this.albumsService.getAlbumByProps(props);
    } catch (error) {
      throw new HttpException(
        'Ошибка Удалить Альбом',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
