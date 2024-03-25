/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';

import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from 'src/tracks/entities/track.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { DatabaseUtils } from 'src/utils/database.utils';
import { TotalAlbumDto } from './dto/total-album.dto';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(AlbumEntity)
    private albumsRepository: Repository<AlbumEntity>,
    @InjectRepository(TrackEntity)
    private tracksRepository: Repository<TrackEntity>,
    @InjectRepository(ReactionEntity)
    private reactionsRepository: Repository<ReactionEntity>,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private dataBaseUtils: DatabaseUtils,
  ) {}

  // ^^ МТД.CRUD
  async createAlbum(
    createAlbumDto: CreateAlbumDto,
    userId: number,
    coverObj?: any,
    totalAlbumData?: TotalAlbumDto,
  ) {
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

    const savedAlbum = await this.albumsRepository.save(album);
    return savedAlbum;
  }

  findAllAlbums() {
    return this.albumsRepository.find();
  }

  findOneAlbum(id: number) {
    return `Это действие возвращает #${id} album`;
  }

  async updateAlbum(
    albumIds: any /* string | number */,
    updateAlbumDto?: UpdateAlbumDto,
    totalAlbumDto?: TotalAlbumDto,
    param?: string,
  ) {
    console.log(
      'a.s. UPD albumIds updateAlbumDto totalAlbumDto param : ',
      albumIds,
      updateAlbumDto,
      totalAlbumDto,
      param,
    );

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
      if (param == 'add') {
        album.total_tracks = album.total_tracks + totalAlbumDto.total_tracks;
      } else if ((param = 'del')) {
        album.total_tracks = album.total_tracks - totalAlbumDto.total_tracks;
      }
    }

    // общ.длительность всех Треков одного Альбома
    if (totalAlbumDto?.total_duration) {
      const [min1, sec1] = album.total_duration.split(':').map(Number);
      const [min2, sec2] = totalAlbumDto.total_duration.split(':').map(Number);
      if (param == 'add') {
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
    if (totalAlbumDto?.genres /* != album.genres */) {
      if (param == 'add') {
        const set = new Set();

        set.add(album.genres);
        // if (album.genres.toLowerCase() !== totalAlbumDto.genres.toLowerCase())
        if (
          !album.genres
            .toLowerCase()
            .includes(totalAlbumDto.genres.toLowerCase())
        ) {
          set.add(totalAlbumDto.genres); // Добавляем второй жанр только если он отличается
        }
        album.genres = Array.from(set).join('; ');
      } else if ((param = 'del')) {
        const filteredGenres = album.genres
          .split(';')
          .map((genre) => genre.trim())
          .filter((genre) => genre !== totalAlbumDto.genres[0].trim())
          .join('; ');
        album.genres = filteredGenres;
      }

      const set = new Set(album.genres.split(';').map((genre) => genre.trim()));

      if (
        param === 'add' &&
        !album.genres.toLowerCase().includes(totalAlbumDto.genres.toLowerCase())
      ) {
        set.add(totalAlbumDto.genres.trim());
      } else if (param === 'del') {
        set.delete(totalAlbumDto.genres.trim());
      }
      const albumGenres = Array.from(set).join('; ');
    }

    // обнов.мягк.удал.
    // if (totalAlbumData?.deletedAt) {
    album.deletedAt = totalAlbumDto.deletedAt;
    // }

    if (updateAlbumDto != null) {
      // album = { ...updateAlbumDto };
      // Обновляем данные альбома, если передан updateAlbumDto
      Object.assign(album, updateAlbumDto);
    }

    console.log('a.s. UPD album 999 : ', album);
    await this.albumsRepository.save(album);
  }

  // пометка Удаления
  removeAlbum(id: number) {
    return `Это действие удаляет #${id} album`;
  }

  // Удаление
  async deleteAlbum(
    ids: any /* string | number */,
    userId?: number,
    totalAlbumDto?: TotalAlbumDto,
    param?: string,
  ) {
    console.log(
      'a.s. DEL ids userId param totalAlbumDto : ',
      ids,
      userId,
      totalAlbumDto,
      param,
    );

    // ошб.е/и нет ID
    if (!ids) {
      throw new NotFoundException('Нет Альбома > Удаления');
    }
    if (!userId && !param && !totalAlbumDto) {
      throw new NotFoundException('Предовращено полное удаление');
    }

    // превращ.ids ф.в масс.
    let idsArray: number[] = [];
    if (isNaN(Number(ids))) {
      // Если ids не является числом, разбиваем строку на массив
      idsArray = ids.split(',').map((id) => parseInt(id.trim(), 10));
    } else {
      // Если ids является числом, добавляем его в массив
      idsArray.push(parseInt(ids, 10));
    }

    // `созд.строит.req` > данн.Альбома/ов
    const qbAlbums = this.albumsRepository
      .createQueryBuilder('albums')
      .withDeleted()
      .where('id IN (:...ids) AND user = :userId', {
        ids: idsArray,
        userId,
      });
    // .where('id IN (:...ids)', { ids: idsArray });
    const qbAlbums2 = await qbAlbums.getRawMany();

    const qbAlbums3 = this.albumsRepository
      .createQueryBuilder('albums')
      .withDeleted()
      .where('id IN (:...ids)', { ids: idsArray });
    const qbAlbums4 = await qbAlbums3.getRawMany();

    // полн.удал.Альбома е/и нет userId
    if (!userId && !param && !totalAlbumDto) {
      return qbAlbums.delete().execute();
    }
    // .softDelete()
    // .execute();

    // `мягк.удал.`ф. при парам.
    if (param) {
      totalAlbumDto.total_tracks <= 1
        ? await qbAlbums.softDelete().execute()
        : await this.updateAlbum(ids, null, totalAlbumDto, param);
      return;
    }

    // ^^ удал.данн.др.табл.

    const albumsData = await qbAlbums
      .select([
        'tracks.path AS path',
        'tracks.coverId',
        // 'tracks.author AS author',
      ])
      .getRawMany();
    const pathArray = albumsData.map((obj) => obj.path);
    const coverIdsArray = albumsData.map((obj) => obj.coverId);
    // const authorIdsArray = albumsData.map((obj) => obj.author);

    // Удаление файлов из локального хранилища
    for (const path of pathArray) {
      try {
        await fs.promises.unlink(path);
      } catch (error) {}
    }

    // запись > удал.; delete - удал.
    // return this.albumsRepository.delete(ids);
  }

  // ^^ ДОП.МТД.
  // поиск по исполнителю
  async searchByAuthor(author: string): Promise<AlbumEntity[]> {
    console.log('serv ATHR : ', author);
    return this.albumsRepository.find({ where: { author: author } });
  }

  // поиск по назв.альбома
  async searchByAlbumName(albumName: string): Promise<AlbumEntity[]> {
    console.log('serv alb_Name : ', albumName);
    return this.albumsRepository.find({ where: { title: albumName } });
  }

  // количество по id.альбома
  async getTrackCountByAlbumId(albumId: number): Promise<number> {
    console.log('serv доп.мтд. alb_Id : ', albumId);
    return this.albumsRepository.count({
      where: { id: albumId },
    });
  }

  // кол-во по Альбому
  async getTrackCountByAlbumName(albumName: string): Promise<number> {
    console.log('serv доп.мтд. alb_Name : ', albumName);
    // return this.albumsRepository.count({ where: { album: albumName }});
    const count = await this.albumsRepository.count({
      where: { title: albumName },
    });
    console.log('serv доп.мтд. count : ' + count);
    return count;
  }

  // универс.fn поиска по автору, альбому, обложки, год, стилю, id
  // async getAlbumByProps(props: Partial<AlbumEntity>): Promise<AlbumEntity[]> {
  async getAlbumByProps(props) {
    console.log('serv props : ', props);
    const { var1, var2 } = props;
    // return this.albumsRepository.find(props);
    // return this.albumsRepository.findOne(props as FindOneOptions<AlbumEntity>);
    // return this.albumsRepository.find({ where: { album: props } });
    // return this.albumsRepository.find({ where: { [var1]: var2 } });
    return this.albumsRepository.find({ where: [props] });
  }
}
