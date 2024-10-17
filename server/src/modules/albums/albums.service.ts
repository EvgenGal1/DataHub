import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { TotalAlbumDto } from './dto/total-album.dto';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { BasicUtils } from '../../common/utils/basic.utils';
import { LoggingWinston } from '../../services/logging/logging.winston';
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../../config/envs/env.consts';

@Injectable()
export class AlbumsService {
  constructor(
    // логгер
    private readonly logger: LoggingWinston,
    // БД SB
    @Optional()
    @InjectRepository(AlbumEntity, 'supabase')
    private albumsRepositorySB: Repository<AlbumEntity>,
    @Optional()
    @InjectRepository(TrackEntity, 'supabase')
    private tracksRepositorySB: Repository<TrackEntity>,
    @Optional()
    @InjectRepository(ReactionEntity, 'supabase')
    private reactionsRepositorySB: Repository<ReactionEntity>,
    @Optional()
    @InjectRepository(FileEntity, 'supabase')
    private fileRepositorySB: Repository<FileEntity>,
    // Общ.зависимости
    private filesService: FilesService,
    private dataBaseUtils: DatabaseUtils,
    private basicUtils: BasicUtils,
    // БД LH
    @Optional()
    @InjectRepository(AlbumEntity, 'localhost')
    private albumsRepository?: Repository<AlbumEntity>,
    @Optional()
    @InjectRepository(TrackEntity, 'localhost')
    private tracksRepository?: Repository<TrackEntity>,
    @Optional()
    @InjectRepository(ReactionEntity, 'localhost')
    private reactionsRepository?: Repository<ReactionEntity>,
    @Optional()
    @InjectRepository(FileEntity, 'localhost')
    private fileRepository?: Repository<FileEntity>,
  ) {}

  // ^ МТД.CRUD

  async createAlbum(
    createAlbumDto: CreateAlbumDto,
    userId: number,
    coverObj?: any,
    totalAlbumData?: TotalAlbumDto,
  ) {
    try {
      // `получить наименьший доступный идентификатор` из БД > табл.album
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('album');
      // объ.album созд./сохр./вернуть
      const album = this.albumsRepository.create({
        ...createAlbumDto,
        id: smallestFreeId,
        user: { id: userId },
        cover: coverObj,
        ...totalAlbumData,
      });
      if (isDevelopment)
        this.logger.info(
          `req + Alb User.ID ${userId}: ${JSON.stringify({
            createAlbumDto,
            coverObj,
            totalAlbumData,
          })}`,
        );
      const savedAlbum = await this.albumsRepository.save(album);
      this.logger.info(`+ Album ID: ${savedAlbum.id}`);
      return savedAlbum;
    } catch (error) {
      this.logger.error(
        `!Ошб. + Album: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      // DEV лог.debug
      if (!isProduction && (isDevelopment || isTotal))
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

  async findAllAlbums() {
    try {
      if (isDevelopment) this.logger.info(`req < Alb All`);
      const allAlb = await this.albumsRepository.find();
      // логи,перем.ошб.
      this.logger.info(
        `Albums All length ${allAlb?.length} < ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
      );
      return allAlb;
    } catch (error) {
      this.logger.error(
        `!Ошб. < Albums: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  async findOneAlbum(id: number) {
    // логи,перем.ошб.
    try {
      if (isDevelopment) this.logger.info(`req < Alb ID ${id}`);
      const alb = await this.albumsRepository.findOne({ where: { id: id } });
      this.logger.info(
        `Album ID ${alb?.id} < ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
      );
      return alb;
    } catch (error) {
      this.logger.error(
        `!Ошб. < Album ID ${id}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  async updateAlbum(
    albumIds: any /* string | number */,
    updateAlbumDto?: UpdateAlbumDto,
    totalAlbumDto?: TotalAlbumDto,
    param?: string,
    userId?: number,
  ) {
    try {
      // ошб.е/и нет ID
      if (!albumIds) {
        throw new NotFoundException('Нет Альбома > Удаления');
      }
      // превращ.ids ф.в масс.
      let idsArray: number[] = [];
      if (isNaN(Number(albumIds))) {
        // Если ids не является числом, разбиваем строку на массив
        idsArray = albumIds.split(',').map((id) => parseInt(id.trim(), 10));
      } else {
        // Если ids является числом, добавляем его в массив
        idsArray.push(parseInt(albumIds, 10));
      }
      // const album = await this.albumsRepository.findOneBy({ id });
      const existingAlbum = await this.albumsRepository
        .createQueryBuilder('albums')
        .withDeleted()
        .where('id IN (:...ids)', { ids: idsArray })
        .getMany();
      // альтер.получ.всех Треков по Альбому и их кол-ву
      // const trackAll = await this.tracksRepository.find({ where: { album: { /* title: updateAlbumDto.title, */ id: id, }, }, });

      const album = existingAlbum[0];
      if (!album) {
        throw new NotFoundException(`Альбом с id ${idsArray} не найдено`);
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

      if (isDevelopment) this.logger.info(`req # Album ${album}`);
      const albUpd = await this.albumsRepository.save(album);
      this.logger.info(`# Album ${album.id}`);
      return albUpd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # Album: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      // DEV лог.debug
      if (!isProduction && (isDevelopment || isTotal))
        this.basicUtils.logDebugDev(
          'alb.s. UPD albumIds updateAlbumDto totalAlbumDto param  :  ',
          albumIds,
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
      if (isDevelopment) this.logger.info(`req - Alb ID ${id}`);
      return `DEL Alb ID ${id}`;
    } catch (error) {
      this.logger.error(
        `!Ошб.удал.Album ID ${id}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // Удаление
  async deleteAlbum(
    ids: any /* string | number */,
    userId?: number,
    totalAlbumDto?: TotalAlbumDto,
    param?: string,
  ) {
    try {
      // ошб.е/и нет ID
      if (!ids) {
        throw new NotFoundException('Нет Альбома > Удаления');
      }
      if (!userId && !param && !totalAlbumDto) {
        throw new NotFoundException('Предовращено полное удаление Альбома');
        // return await this.albumsRepository.delete(ids);
      }

      // превращ.ids ф.в масс.
      const idsArray: number[] = Array.isArray(ids)
        ? ids.map((id: string | number) => parseInt(id.toString().trim(), 10))
        : isNaN(Number(ids))
          ? ids.split(',').map((id) => parseInt(id.trim(), 10))
          : [parseInt(ids, 10)];
      // let idsArray: number[] = [];
      // if (isNaN(Number(ids))) {
      //   // Если ids не является числом, разбиваем строку на массив
      //   idsArray = ids.split(',').map((id) => parseInt(id.trim(), 10));
      // } else {
      //   // Если ids является числом, добавляем его в массив
      //   idsArray.push(parseInt(ids, 10));
      // }

      // `созд.строит.req` > данн.Альбома/ов
      const qbAlbums = this.albumsRepository
        .createQueryBuilder('albums')
        .withDeleted()
        .where('id IN (:...ids)', { ids: idsArray });
      // .where({ ids: idsArray });
      const qbAlbumsGet = await qbAlbums.getRawMany();

      // полн.удал.Альбома е/и нет userId
      if (!userId && !param && !totalAlbumDto) {
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
          if (isDevelopment) this.logger.info(`req - Alb ID ${ids}`);

          // е/и в Альбоме 1 Трек
          if (albumOne.albums_total_tracks === 1) {
            // удал.ф.Обложки из табл.File по fileId
            await this.filesService.removeFile(
              albumOne.albums_coverId,
              userId,
              `del`,
            );
            // cохр.измен.
            await this.albumsRepository.save({
              id: albumOne.albums_id,
              genres: '',
              total_tracks: 0,
              total_duration: '0:00',
            });
            this.logger.info(
              `DEL Alb ID ${await this.basicUtils.hendlerTypesErrors(ids)}`,
            );
            // мягк.удал.
            albDel = await qbAlbums.softDelete().execute();
            // .where('id IN (:...ids)', { ids: idsArray })
          } else {
            this.logger.info(
              `DEL Alb ID ${await this.basicUtils.hendlerTypesErrors(ids)}`,
            );
            albDel = await this.updateAlbum(ids, null, totalAlbumDto, param);
          }
          this.logger.info(`- Alb ${ids}`);
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
        `!Ошб.удал.Album ID ${await this.basicUtils.hendlerTypesErrors(ids)}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // ^ ДОП.МТД.

  // Alb по автору
  async searchByAuthor(author: string): Promise<AlbumEntity[]> {
    try {
      if (isDevelopment) this.logger.info(`req ? Alb.ATHR : ${author}`);
      const albAthr = await this.albumsRepository.find({
        where: { author },
      });
      this.logger.info(`? Alb.ATHR ${author} title : ${albAthr[0].title}`);
      return albAthr;
    } catch (error) {
      this.logger.error(
        `!Ошб.поиска по Alb.author ${author} : ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
      // throw new InternalServerErrorException('Ошибка при поиске по автору');
    }
  }

  // Alb по назв.
  async searchByAlbumName(albumName: string): Promise<AlbumEntity[]> {
    try {
      if (isDevelopment) this.logger.info(`req ? Alb.TITL : ${albumName}`);
      const albNam = await this.albumsRepository.find({
        where: { title: albumName },
      });
      this.logger.info(`? Alb.TITL ${albumName} author : ${albNam[0].author}`);
      return albNam;
    } catch (error) {
      this.logger.error(
        `!Ошб.поиска по Alb.titl ${albumName} : ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // кол-во по назв.Alb
  async getTrackCountByAlbumName(albumName: string): Promise<number> {
    try {
      if (isDevelopment) this.logger.info(`req +? Alb.name : ${albumName}`);
      const album = await this.albumsRepository.findOne({
        where: {
          title: albumName,
        },
      });
      const totalTracks = album ? album.total_tracks : 0;
      this.logger.info(`Alb.name ${albumName} count Track : ${totalTracks}`);
      return totalTracks;
    } catch (error) {
      this.logger.error(
        `!Ошб.кол-ва Треков по Alb.name ${albumName} : ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // кол-во по id.Alb
  async getTrackCountByAlbumId(albumId: number): Promise<number> {
    try {
      if (isDevelopment) this.logger.info(`req +? Alb.id : ${albumId}`);
      const album = await this.albumsRepository.findOne({
        where: {
          id: albumId,
        },
      });
      const totalTracks = album ? album.total_tracks : 0;
      this.logger.info(`Alb.ID ${albumId} count Track : ${totalTracks}`);
      return totalTracks;
    } catch (error) {
      this.logger.error(
        `!Ошб.кол-ва Треков по Alb.ID ${albumId} : ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // универс.fn поиска по автору, альбому, обложки, год, стилю, id
  async getAlbumByProps(props: Partial<AlbumEntity>): Promise<AlbumEntity[]> {
    try {
      // const { var1, var2 } = props;
      // return this.albumsRepository.find(props);
      // return this.albumsRepository.findOne(props as FindOneOptions<AlbumEntity>);
      // return this.albumsRepository.find({ where: { album: props } });
      // return this.albumsRepository.find({ where: { [var1]: var2 } });

      if (isDevelopment) this.logger.info(`req ??? ALBOM парам.: ${props}`);
      const albProp = await this.albumsRepository.find({ where: [props] });
      this.logger.info(
        `Alb props : ${await this.basicUtils.hendlerTypesErrors(albProp)}`,
      );
      return albProp;
    } catch (error) {
      this.logger.error(
        `!Ошб.универ-го поиска по свойствам: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }
}
