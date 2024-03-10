/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
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
    private databaseUtils: DatabaseUtils,
  ) {}

  // ^^ МТД.CRUD
  async createAlbum(createAlbumDto: CreateAlbumDto, userId: number) {
    // `получить наименьший доступный идентификатор` из БД > табл.role
    const smallestFreeId =
      await this.databaseUtils.getSmallestIDAvailable('album');
    // объ.track созд./сохр./вернуть
    const album = this.albumsRepository.create({
      ...createAlbumDto,
      // ...alb,
      id: smallestFreeId,
    });
    console.log('a.s. album : ', album);
    const savedAlbum = await this.albumsRepository.save(album);
    return savedAlbum;
  }

  findAllAlbums() {
    return this.albumsRepository.find();
  }

  findOneAlbum(id: number) {
    return `Это действие возвращает #${id} album`;
  }

  updateAlbum(id: number, updateAlbumDto: UpdateAlbumDto) {
    return `Это действие обновляет #${id} album`;
  }

  removeAlbum(id: number) {
    return `Это действие удаляет #${id} album`;
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
