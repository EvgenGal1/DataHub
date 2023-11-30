/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Like, ObjectId, Repository } from 'typeorm';

import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from 'src/track/entities/track.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(AlbumEntity)
    private albumsRepository: Repository<AlbumEntity>,
    @InjectRepository(TrackEntity)
    private tracksRepository: Repository<TrackEntity>,
    @InjectRepository(ReactionEntity)
    private reactionsRepository: Repository<ReactionEntity>,
  ) {}

  // ^^ МТД.CRUD
  createAlbum(createAlbumDto: CreateAlbumDto) {
    return 'This action adds a new album';
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
    return this.albumsRepository.find({ where: { author: author } });
  }

  // поиск по назв.альбома
  async searchByAlbumName(albumName: string): Promise<AlbumEntity[]> {
    return this.albumsRepository.find({ where: { album: albumName } });
  }

  // количество по id.альбома
  async getTrackCountByAlbumId(albumId: number): Promise<number> {
    return this.albumsRepository.count({
      where: { id: albumId },
    });
  }

  // кол-во по Альбому
  async getTrackCountByAlbumName(albumName: string): Promise<number> {
    // return this.albumsRepository.count({ where: { album: albumName }});
    const count = await this.albumsRepository.count({
      where: { album: albumName },
    });

    return count;
  }

  // универс.fn
  // async getAlbumByProps(props: Partial<AlbumEntity>): Promise<AlbumEntity[]> {
  async getAlbumByProps(props) {
    const { var1, var2 } = props;
    // return this.albumsRepository.find(props);
    // return this.albumsRepository.findOne(props as FindOneOptions<AlbumEntity>);
    // return this.albumsRepository.find({ where: { album: props } });
    // return this.albumsRepository.find({ where: { [var1]: var2 } });
    return this.albumsRepository.find({ where: [props] });
  }
}
