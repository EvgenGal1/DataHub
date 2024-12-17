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
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AlbumEntity } from './entities/album.entity';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { UserId } from '../../common/decorators/user-id.decorator';
import { BasicUtils } from '../../common/utils/basic.utils';
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
    private readonly basicUtils: BasicUtils,
    private readonly logger: LoggingWinston,
  ) {}

  // ^^ МТД.CRUD

  @Post()
  @ApiOperation({ summary: 'Создать Альбом' })
  async createAlbum(
    @Body() createAlbumDto: CreateAlbumDto,
    @UserId() userId: number,
  ) {
    this.logger.debug(
      `req User.ID '${userId}' + Alb DTO: '${JSON.stringify(createAlbumDto)}'`,
    );
    return this.albumsService.createAlbum(createAlbumDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Альбомы' })
  async findAllAlbum() {
    this.logger.debug(`req << Alb All`);
    return this.albumsService.findAllAlbums();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Альбом' })
  async findOneAlbum(@Param('id') id: number) {
    this.logger.debug(`req < Alb.ID '${id}'`);
    return this.albumsService.findOneAlbum(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Альбом' })
  async updateAlbum(
    @Param('id') id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    this.logger.debug(`req # Alb.ID '${id}'`);
    return this.albumsService.updateAlbum(+id, updateAlbumDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Альбом' })
  async removeAlbum(@Param('id') id: number) {
    this.logger.debug(`req - Alb.ID '${id}'`);
    return this.albumsService.removeAlbum(id);
  }

  @Delete(':ids')
  @ApiOperation({ summary: 'Удалить Альбом/ы по IDs' })
  @ApiParam({
    name: 'ids',
    required: true,
    description: 'IDs Альбома/ов ч/з запятые',
    type: String,
  })
  @ApiQuery({
    name: 'hardDelete',
    required: false,
    description: 'Флаг полного Удаления',
    type: Boolean,
  })
  async deleteAlbums(
    @Param('ids') idsString: string,
    @Query('hardDelete') hardDelete: boolean,
    @UserId() userId: number,
  ) {
    // разбир. IDs из стр.
    const ids = await this.basicUtils.parseIdsFromString(idsString);
    this.logger.debug(
      `req - Albums.IDs '${ids}' ${hardDelete ? 'HardDel' : ''} от User.ID '${userId}'`,
    );
    return this.albumsService.deleteAlbums(ids, userId, hardDelete);
  }

  // ^^ ДОП.МТД. ----------------------------------------------------------------------------------

  // Получить по Параметрам Альбома <> данн.Треков
  @Get('/params/:paramField/:paramValue') //:
  @ApiOperation({
    summary:
      'Получить по Параметрам Альбома <> данным Треков (кол-во / длительность / прослушиваний)',
  })
  // параметры выбора: Поле/Значение (из Param стр.)
  @ApiParam({
    name: 'paramField',
    enum: [
      'id',
      'title',
      'author',
      'genres',
      'year',
      'description',
      'coverArtId',
    ],
    required: true,
    description: 'Поле Параметра',
  })
  @ApiParam({
    name: 'paramValue',
    required: true,
    description: 'Значение Параметра',
  })
  // опцион.возвращ.тип (из стр.req)
  @ApiQuery({
    name: 'returnType',
    enum: ['countTracks', 'durationTracks', 'listensTrack'],
    required: false,
    description: 'Тип возврата (кол-во / длительность / прослушиваний)',
  })
  async findAlbumsByParams(
    @Param('paramField') paramField: string,
    @Param('paramValue') paramValue: string,
    @Query('returnType') returnType: string,
  ): Promise<AlbumEntity[] | number> {
    this.logger.debug(
      `req << Albums Param '${paramField}'/'${paramValue}' ${returnType ? `return '${returnType}'` : ''}`,
    );
    return this.albumsService.findAlbumsByParams(
      paramField,
      paramValue,
      returnType,
    );
  }
}
