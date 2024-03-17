/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Like, ObjectId, Repository } from 'typeorm';

import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from 'src/tracks/entities/track.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/entities/file.entity';
import { DatabaseUtils } from 'src/utils/database.utils';

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
    totalAlbumData?: any,
  ) {
    console.log(
      'a.s.CRE createAlbumDto userId coverObj : ',
      createAlbumDto,
      userId,
      coverObj,
      totalAlbumData,
    );
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
    console.log('a.s.CRE album : ', album);

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
    id: number,
    updateAlbumDto?: UpdateAlbumDto,
    totalAlbumData?: any,
  ) {
    console.log('a.s.UPD totalAlbumData : ', totalAlbumData);

    const album = await this.albumsRepository.findOneBy({ id });

    // общ.кол-во.всех Треков одного Альбома
    if (totalAlbumData.total_tracks) {
      album.total_tracks = album.total_tracks + totalAlbumData.total_tracks;
      // альтер.получ.всех Треков по Альбому и их кол-ву
      // const trackAll = await this.tracksRepository.find({ where: { album: { /* title: updateAlbumDto.title, */ id: id, }, }, });
      // album.total_tracks = trackAll.length + totalAlbumData.total_tracks;
    }

    // общ.длительность всех Треков одного Альбома
    if (totalAlbumData?.total_duration) {
      const [min1, sec1] = album.total_duration.split(':').map(Number);
      const [min2, sec2] = totalAlbumData.total_duration.split(':').map(Number);
      let totalSeconds = (min1 + min2) * 60 + sec1 + sec2;
      const totalMinutes = Math.floor(totalSeconds / 60);
      totalSeconds %= 60;
      album.total_duration = `${totalMinutes}:${
        totalSeconds < 10 ? '0' : ''
      }${totalSeconds}`;
      // альтер.получ.данн.ч/з basicUtils.sumDurations
      // await this.basicUtils.sumDurations( album.total_duration, totalAlbumData.total_duration );
    }

    // объед.жанры всех Треков одного Альбома
    if (totalAlbumData?.styles) {
      const set = new Set();
      console.log('album.styles : ', album.styles);
      set.add(album.styles);
      // if (album.styles.toLowerCase() !== totalAlbumData.styles.toLowerCase())
      if (
        !album.styles
          .toLowerCase()
          .includes(totalAlbumData.styles.toLowerCase())
      ) {
        set.add(totalAlbumData.styles); // Добавляем второй жанр только если он отличается
      }
      album.styles = Array.from(set).join('; ');
    }

    console.log(
      'a.s.UPD album.total_tracks, album.total_durationб album.styles : ',
      album.total_tracks,
      album.total_duration,
      album.styles,
    );
    await this.albumsRepository.save(album);
  }

  async updateAlbumParam(
    albumId: number | any,
    duration: string | any,
    trackCount: number | any,
    styles: string | any,
  ): Promise<void> {
    const album = await this.albumsRepository.findOne({
      where: { id: albumId },
    });

    if (!album) {
      throw new NotFoundException(`Альбом с id ${albumId} не найдено`);
    }

    if (album.total_tracks == 1) {
      await this.albumsRepository.delete(albumId);
    } else {
      const durationArray = duration.split(':');
      const durationMinutes = parseInt(durationArray[0], 10);
      const durationSeconds = parseInt(durationArray[1], 10);

      const totalDuration = album.total_duration.split(':');
      let newDurationMinutes = Number(totalDuration[0]) - durationMinutes;
      let newDurationSeconds = Number(totalDuration[1]) - durationSeconds;

      if (newDurationSeconds < 0) {
        newDurationMinutes--; // Уменьшаем минуты, если секунды отрицательные
        newDurationSeconds += 60; // Добавляем 60 секунд, чтобы они стали положительными
      }

      album.total_duration = `${newDurationMinutes}:${newDurationSeconds}`;

      const albTrc = Number(album.total_tracks) - Number(trackCount);
      album.total_tracks = albTrc;
      const filteredStyles = album.styles
        .split(';')
        .map((style) => style.trim())
        .filter((style) => style !== styles[0].trim())
        .join('; ');
      album.styles = filteredStyles;

      await this.albumsRepository.save(album);
    }
  }

  // пометка Удаления
  removeAlbum(id: number) {
    return `Это действие удаляет #${id} album`;
  }

  // Удаление
  async deleteAlbum(id: number) {
    // запись > удал.; delete - удал.
    return this.albumsRepository.delete(id);
  }

  // ^^ ДОП.МТД.
  // поиск по исполнителю
  async searchByAuthor(author: string): Promise<AlbumEntity[]> {
    console.log('serv ATHR : ' + author);
    console.log(author);
    return this.albumsRepository.find({ where: { author: author } });
  }

  // поиск по назв.альбома
  async searchByAlbumName(albumName: string): Promise<AlbumEntity[]> {
    console.log('serv alb_Name : ' + albumName);
    console.log(albumName);
    return this.albumsRepository.find({ where: { title: albumName } });
  }

  // количество по id.альбома
  async getTrackCountByAlbumId(albumId: number): Promise<number> {
    console.log('serv доп.мтд. alb_Id : ' + albumId);
    console.log(albumId);
    return this.albumsRepository.count({
      where: { id: albumId },
    });
  }

  // кол-во по Альбому
  async getTrackCountByAlbumName(albumName: string): Promise<number> {
    console.log('serv доп.мтд. alb_Name : ' + albumName);
    console.log(albumName);
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
    console.log('serv props : ' + props);
    console.log(props);
    const { var1, var2 } = props;
    // return this.albumsRepository.find(props);
    // return this.albumsRepository.findOne(props as FindOneOptions<AlbumEntity>);
    // return this.albumsRepository.find({ where: { album: props } });
    // return this.albumsRepository.find({ where: { [var1]: var2 } });
    return this.albumsRepository.find({ where: [props] });
  }
}
