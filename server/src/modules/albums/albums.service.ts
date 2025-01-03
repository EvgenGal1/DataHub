import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { TotalAlbumDto } from './dto/total-album.dto';
import { ThrowError } from '../../common/filters/error.utils';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import { isProduction, isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class AlbumsService {
  constructor(
    private readonly logger: LoggingWinston,
    @InjectRepository(FileEntity, process.env.DB_NAM)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(TrackEntity, process.env.DB_NAM)
    private readonly tracksRepository: Repository<TrackEntity>,
    @InjectRepository(AlbumEntity, process.env.DB_NAM)
    private readonly albumsRepository: Repository<AlbumEntity>,
    @InjectRepository(ReactionEntity, process.env.DB_NAM)
    private readonly reactionsRepository: Repository<ReactionEntity>,
    private readonly filesService: FilesService,
    private readonly dataBaseUtils: DatabaseUtils,
    private readonly basicUtils: BasicUtils,
  ) {}

  async createAlbum(
    createAlbumDto: CreateAlbumDto,
    userId: number,
    coverObj?: any,
    totalAlbumData?: TotalAlbumDto,
  ): Promise<AlbumEntity> {
    try {
      if (isDevelopment)
        this.logger.debug(
          `db + Alb User.ID '${userId}' DTO : '${JSON.stringify({
            createAlbumDto,
            coverObj,
            totalAlbumData,
          })}'`,
        );

      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('album');
      const album = this.albumsRepository.create({
        ...createAlbumDto,
        id: smallestFreeId,
        user: { id: userId },
        coverArt: coverObj,
        ...totalAlbumData,
      });
      if (!album) {
        this.logger.warn(
          `Album DTO '${JSON.stringify(createAlbumDto)}' не создан`,
        );
        throw new NotFoundException(
          `User DTO '${JSON.stringify({
            createAlbumDto,
            coverObj,
            totalAlbumData,
          })}' не создан`,
        );
      }

      const savedAlbum = await this.albumsRepository.save(album);
      if (!savedAlbum) {
        this.logger.warn(
          `Album DTO '${JSON.stringify(createAlbumDto)}' не сохранён`,
        );
        throw new NotFoundException(
          `Album DTO '${JSON.stringify({
            createAlbumDto,
            coverObj,
            totalAlbumData,
          })}' не сохранён`,
        );
      }
      this.logger.debug(`+ Album.ID '${savedAlbum[0].id}'`);
      return savedAlbum[0];
    } catch (error) {
      this.logger.error(
        `!Ошб. + Album: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          'alb.s. CRE createAlbumDto userId coverObj totalAlbumData : ',
          createAlbumDto,
          userId,
          coverObj,
          totalAlbumData,
        );
      throw error;
    }
  }

  async findAllAlbums(): Promise<AlbumEntity[]> {
    try {
      if (isDevelopment) this.logger.info(`db << Albums All`);
      const albumsAll = await this.albumsRepository.find();
      if (!albumsAll) {
        this.logger.warn(`Albums All не найден`);
        throw new NotFoundException(`Albums All не найден`);
      }
      this.logger.debug(
        `<< Albums All length '${albumsAll?.length}' < БД '${
          isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'
        }'`,
      );
      return albumsAll;
    } catch (error) {
      this.logger.error(
        `!Ошб. << Albums: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  async findOneAlbum(id: number): Promise<AlbumEntity> {
    try {
      if (isDevelopment) this.logger.info(`db < Album.ID '${id}'`);
      const album = await this.albumsRepository.findOneBy({ id });
      if (!album) {
        this.logger.warn(`Album.ID '${id}' не найден`);
        throw new NotFoundException(`Album.ID '${id}' не найден`);
      }
      this.logger.debug(`< Album.ID '${album?.id}'`);
      return album;
    } catch (error) {
      this.logger.error(
        `!Ошб. < Album.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // мтд.обновить
  async updateAlbum(
    id: number,
    updateAlbumDto?: UpdateAlbumDto,
    totalAlbumDto?: TotalAlbumDto,
    param?: string,
    userId?: number,
  ): Promise<AlbumEntity> {
    try {
      if (isDevelopment)
        this.logger.debug(
          `db # Albub.ID '${id}' c User.ID '${userId}' по DTO : '${JSON.stringify(
            {
              updateAlbumDto,
              totalAlbumDto,
              param,
            },
          )}'`,
        );

      const album = await this.albumsRepository.findOneBy({ id });
      // альтер.получ.всех Треков по Альбому и их кол-ву
      // const trackAll = await this.tracksRepository.find({ where: { album: { /* title: updateAlbumDto.title, */ id: id, }, }, });
      if (!album) {
        this.logger.warn(`Album.ID '${id}' не найден`);
        throw new NotFoundException(`Album.ID '${id}' не найден`);
      }

      // общ.кол-во.всех Треков одного Альбома
      if (totalAlbumDto?.total_tracks) {
        if (param === 'add') album.total_tracks += totalAlbumDto.total_tracks;
        else if (param === 'del')
          album.total_tracks -= totalAlbumDto.total_tracks;
      }

      // общ.длительность всех Треков одного Альбома
      if (totalAlbumDto?.total_duration) {
        const [min1, sec1] = album.total_duration.split(':').map(Number);
        const [min2, sec2] = totalAlbumDto.total_duration
          .split(':')
          .map(Number);
        let totalSeconds =
          (min1 + (param === 'add' ? min2 : -min2)) * 60 +
          sec1 +
          (param === 'add' ? sec2 : -sec2);
        const totalMinutes = Math.floor(totalSeconds / 60);
        totalSeconds %= 60;
        album.total_duration = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
        if (param === 'add') {
          let totalSeconds = (min1 + min2) * 60 + sec1 + sec2;
          const totalMinutes = Math.floor(totalSeconds / 60);
          totalSeconds %= 60;
          album.total_duration = `${totalMinutes}:${
            totalSeconds < 10 ? '0' : ''
          }${totalSeconds}`;
          // альтер.получ.данн.ч/з basicUtils.sumDurations
          // await this.basicUtils.sumDurations( album.total_duration, totalAlbumDto.total_duration );
          const albumTotal_duration = `${totalMinutes}:${String(
            totalSeconds % 60,
          ).padStart(2, '0')}`;
        } else if ((param = 'del')) {
          const durationArray = totalAlbumDto.total_duration.split(':');
          const durationMinutes = parseInt(durationArray[0], 10);
          const durationSeconds = parseInt(durationArray[1], 10);
          const totalDuration = album.total_duration.split(':');
          let newDurationMinutes = Number(totalDuration[0]) - durationMinutes;
          let newDurationSeconds = Number(totalDuration[1]) - durationSeconds;

          let newMinutes = min1 - /* dMin */ min2;
          let newSeconds = sec1 - /* dSec */ sec2;

          if (newDurationSeconds < 0) {
            newDurationMinutes--; // Уменьшаем минуты, если секунды отрицательные
            newDurationSeconds += 60; // Добавляем 60 секунд, чтобы они стали положительными
          }
          if (newSeconds < 0) {
            newMinutes--;
            newSeconds += 60;
          }

          album.total_duration = `${newDurationMinutes}:${newDurationSeconds}`;
          const albumTotal_duration = `${newMinutes}:${String(
            newSeconds,
          ).padStart(2, '0')}`;
        }
        // ^^ краткая версия_1. проверить
        // let totalSeconds = (min1 + (param === 'add' ? min2 : -min2)) * 60 + sec1 + (param === 'add' ? sec2 : -sec2);
        // let totalMinutes = Math.floor(totalSeconds / 60);
        // totalSeconds %= 60;
        // album.total_duration = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
        // ^^ краткая версия_2. проверить
        // const modifier = param === 'add' ? 1 : -1;
        // const totalMinutes = min1 + modifier * min2;
        // const totalSeconds = sec1 + modifier * sec2;
        // let totalSecondsAdjusted = totalSeconds;
        // let totalMinutesAdjusted = totalMinutes;
        // if (totalSecondsAdjusted < 0) {
        //   totalSecondsAdjusted += 60;
        //   totalMinutesAdjusted--;
        // } else if (totalSecondsAdjusted >= 60) {
        //   totalSecondsAdjusted -= 60;
        //   totalMinutesAdjusted++;
        // }
      }

      // объед.жанры всех Треков одного Альбома
      if (updateAlbumDto?.genres || totalAlbumDto?.genres) {
        const genresDto = updateAlbumDto?.genres || totalAlbumDto?.genres;
        if (param === 'add') {
          const set = new Set();

          set.add(album.genres);
          // жанра нет (пустой Альбом)
          if (album?.genres === null) {
            set.add(genresDto);
          }
          // добав.второй жанр если отличается
          else if (
            !album.genres.toLowerCase().includes(genresDto.toLowerCase())
          ) {
            set.add(genresDto);
          }
          album.genres = Array.from(set).join('; ');
        } else if (param === 'del') {
          const filteredGenres = album.genres
            .split(';')
            .map((genre) => genre.trim())
            .filter((genre) => genre !== genresDto[0].trim())
            .join('; ');
          album.genres = filteredGenres;
        }

        const set = new Set(
          album.genres.split(';').map((genre) => genre.trim()),
        );

        if (
          param === 'add' &&
          !album.genres.toLowerCase().includes(genresDto.toLowerCase())
        ) {
          set.add(genresDto.trim());
        } else if (param === 'del') {
          set.delete(genresDto.trim());
        }
        // const albumGenres = Array.from(set).join('; ');
      }

      // обнов.мягк.удал.
      // if (totalAlbumData?.deletedAt) {
      album.deletedAt = totalAlbumDto.deletedAt;
      // }

      if (updateAlbumDto != null) {
        // Обновляем данные альбома, если передан updateAlbumDto
        Object.assign(album, updateAlbumDto);
      }

      if (isDevelopment)
        this.logger.info(
          `db # Album '${await this.basicUtils.hendlerTypesErrors(album)}'`,
        );
      const albUpd = await this.albumsRepository.save(album);
      if (!albUpd) {
        this.logger.error(
          `Album.ID '${id}' по DTO '${JSON.stringify({
            updateAlbumDto,
            totalAlbumDto,
            param,
          })}' не обновлён`,
        );
        throw new NotFoundException(
          `Album.ID '${id}' по DTO '${JSON.stringify({
            updateAlbumDto,
            totalAlbumDto,
            param,
          })}' не обновлён`,
        );
      }

      this.logger.debug(`# Album.ID '${albUpd.id}'`);
      return albUpd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # Album: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          'alb.s. UPD Param - id | updateAlbumDto | totalAlbumDto | param :  ',
          id,
          updateAlbumDto,
          totalAlbumDto,
          param,
        );
      throw error;
    }
  }

  // пометка Удаления
  async removeAlbum(id: number) {
    try {
      if (isDevelopment) this.logger.info(`db - Album.ID '${id}'`);
      const albRem = await this.albumsRepository.softDelete(id);
      if (!albRem) {
        this.logger.warn(`Album.ID '${id}' не удалён`);
        throw new NotFoundException(`Album.ID '${id}' не удалён`);
      }
      this.logger.debug(`- Album.ID : '${albRem}'`);
      return albRem;
    } catch (error) {
      this.logger.error(
        `!Ошб. - Album.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // востановить
  // async restoreAlbim(id: number|string) {
  //   return await this.albumsRepository.restore(id);
  // }

  // Удаление
  async deleteAlbum(
    albumIds: string | number,
    userId?: number,
    totalAlbumDto?: TotalAlbumDto,
    param?: string,
  ) {
    try {
      if (isDevelopment) this.logger.info(`db - Album.ID '${albumIds}'`);
      // ошб.е/и нет ID
      if (!albumIds) {
        this.logger.warn('Нет Альбома/ов > Удаления');
        throw new NotFoundException('Нет Альбома/ов > Удаления');
      }
      if (!userId && !param && !totalAlbumDto) {
        this.logger.warn('Предовращено полное удаление Альбома/ов');
        throw new NotFoundException('Предовращено полное удаление Альбома/ов');
      }

      // превращ.albumIds ф.в масс.
      // const idsArray: number[] = Array.isArray(albumIds)
      //   ? albumIds.map((id: number | number) =>
      //       parseInt(id.toString().trim(), 10),
      //     )
      //   : isNaN(Number(albumIds))
      //     ? albumIds.split(',').map((id) => parseInt(id.trim(), 10))
      //     : [parseInt(albumIds, 10)];
      //
      // let idsArray: number[] = [];
      // if (isNaN(Number(albumIds))) {
      //   // Если albumIds не является числом, разбиваем строку на массив
      //   idsArray = albumIds.split(',').map((id) => parseInt(id.trim(), 10));
      // } else {
      //   // Если albumIds является числом, добавляем его в массив
      //   idsArray.push(parseInt(albumIds, 10));
      // }
      //
      let idsArray: number[] = [];
      if (typeof albumIds === 'string' && isNaN(Number(albumIds))) {
        // Если ids не является числом, разбиваем строку на массив
        idsArray = albumIds.split(',').map((id) => parseInt(id.trim(), 10));
      } else if (typeof albumIds === 'number') {
        // Если ids является числом, добавляем его в массив
        idsArray.push(albumIds);
      }

      // `созд.строит.req` > данн.Альбома/ов
      const qbAlbums = this.albumsRepository
        .createQueryBuilder('albums')
        .withDeleted()
        .where('id IN (:...ids)', { ids: idsArray });
      // .where({ ids: idsArray });
      const qbAlbumsGet = await qbAlbums.getRawMany();

      // полн.удал.Альбома е/и нет userId
      if (!userId && !param && !totalAlbumDto) {
        this.logger.warn(`Запрет полн.удал. Альбома/ов '${albumIds}'`);
        throw new NotFoundException(
          `Запрет полн.удал. Альбома/ов '${albumIds}'`,
        );
        return await qbAlbums.delete().execute();
      }

      // ^^ удал.данн.др.табл.

      // перебор всех track
      // for (let i = 0; i < qbAlbumsGet.length; i++) {
      for (const albumOne of qbAlbumsGet) {
        // const albumOne = qbAlbumsGet[i];
        // `мягк.удал.`ф. при парам.

        let albDel;
        if (param === 'del') {
          if (isDevelopment) this.logger.info(`db - Alb ID '${albumIds}'`);

          // е/и в Альбоме 1 Трек
          if (albumOne.albums_total_tracks === 1) {
            // удал.ф.Обложки из табл.File по fileId
            await this.filesService.removeFile(
              albumOne.albums_coverId,
              userId,
              `del`,
            );
            // cохр.измен.
            const albSav = await this.albumsRepository.save({
              id: albumOne.albums_id,
              genres: '',
              total_tracks: 0,
              total_duration: '0:00',
            });
            if (!albSav) {
              this.logger.warn(
                `Album.ID '${albumIds}' по DTO '${JSON.stringify({
                  totalAlbumDto,
                  param,
                })}' не сохранён`,
              );
              throw new NotFoundException(
                `Album.ID '${albumIds}' по DTO '${JSON.stringify({
                  totalAlbumDto,
                  param,
                })}' не сохранён`,
              );
            }
            this.logger.debug(`DEL Album.ID '${albumIds}'`);
            // мягк.удал.
            albDel = await qbAlbums.softDelete().execute();
            // .where('id IN (:...albumIds)', { albumIds: idsArray })
          } else if (albumOne.albums_total_tracks > 1) {
            this.logger.debug(`DEL Album.ID '${albumIds}'`);
            albDel = await this.updateAlbum(
              +albumIds,
              null,
              totalAlbumDto,
              param,
            );
          }
          this.logger.debug(`- Alb '${albumIds}'`);
          return albDel;
        }
      }

      // ^^ удал.данн.др.табл.
      // !! опред.доп.вызов выше очистки/удаления в Альбоме иначе сброс
      // eslint-disable-next-line prefer-const
      // /* const */ albumsData = await qbAlbums
      //   .select([
      //     'albums.path AS path',
      //     'albums.coverId',
      //     // 'tracks.author AS author',
      //   ])
      //   .getRawMany();
      // const pathArray = albumsData.map((obj) => obj.path);
      // const coverIdsArray = albumsData.map((obj) => obj.coverId);
      // const authorIdsArray = albumsData.map((obj) => obj.author);

      // Удаление файлов из локального хранилища
      // for (const path of pathArray) {
      //   try {
      //     await fs.promises.unlink(path);
      //   } catch (error) {}
      // }

      // запись > удал.; delete - удал.
      // return this.albumsRepository.delete(ids);
    } catch (error) {
      this.logger.error(
        `!Ошб.- Album.ID '${albumIds}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  async deleteAlbums(
    ids: number[],
    userId: number,
    hardDelete: boolean = false,
  ): Promise<DeleteResult> {
    const albums = await this.albumsRepository.findBy({ id: In(ids) });

    if (albums.length !== ids.length) {
      this.logger.warn(`Некоторые альбомы не найдены`);
      ThrowError(HttpStatus.NOT_FOUND, 'Некоторые альбомы не найдены');
    }

    for (const album of albums) {
      // Мягкое удаление всех треков в альбоме
      for (const track of album.tracks) {
        await this.tracksRepository.softDelete(track.id);
      }
      // Мягкое удаление обложки альбома
      if (album.coverArt) {
        await this.fileRepository.softDelete(album.coverArt.id);
      }
      // Удаление реакций на альбом
      await this.reactionsRepository.delete({ album: album });
    }

    if (hardDelete) {
      // Полное удаление альбомов
      return this.albumsRepository.delete({ id: In(ids) });
    } else {
      // Мягкое удаление альбомов
      return this.albumsRepository.softDelete({ id: In(ids) });
    }
  }

  // ^ ДОП.МТД. ----------------------------------------------------------------------------------

  async findAlbumsByParams(
    paramField: string,
    paramValue: string,
    returnType: string = 'albums',
  ): Promise<AlbumEntity[] | number> {
    try {
      if (isDevelopment)
        this.logger.info(
          `db << Albums Param '${paramField}'/'${paramValue}' ${returnType ? `return '${returnType}'` : ''}`,
        );

      const where = {};
      where[paramField] = paramValue;

      const albums = await this.albumsRepository.find({ where });
      console.log('albums : ', albums);

      if (!albums || albums.length === 0)
        throw new NotFoundException(
          `Albums with ${paramField} '${paramValue}' not found`,
        );

      this.logger.debug(`Found ${albums.length} albums`);
      if (returnType === 'albums') return albums;

      // обраб.тип возврата Треков (количество / продолжительность / прослушиваний)
      if (returnType === 'countTracks') {
        return albums.reduce((total, album) => total + album.total_tracks, 0);
      } else if (returnType === 'durationTracks') {
        return albums.reduce(
          (total, album) => total + Number(album.total_duration),
          0,
        );
      } else if (returnType === 'listensTrack') {
        let totalListens = 0;
        for (const album of albums) {
          const tracks = await this.tracksRepository
            .createQueryBuilder('track')
            .innerJoin('track.albums', 'album')
            .where('album.id = :albumId', { albumId: album.id })
            .getMany();

          tracks.forEach((track) => {
            totalListens += track.listens;
          });
        }
        return totalListens;
      }
    } catch (error) {
      this.logger.error(`Error searching albums: ${error}`);
      throw error;
    }
  }
}
