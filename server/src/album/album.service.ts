/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, ObjectId, Repository } from 'typeorm';

import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from 'src/track/entities/track.entity';
import { CommentEntity } from 'src/track/entities/comment.entity';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(AlbumEntity)
    private albumsRepository: Repository<AlbumEntity>,
    @InjectRepository(TrackEntity)
    private tracksRepository: Repository<TrackEntity>,
    @InjectRepository(CommentEntity)
    private commentsRepository: Repository<CommentEntity>,
  ) {}

  // ^^ МТД.CRUD
  create(createAlbumDto: CreateAlbumDto) {
    return 'This action adds a new album';
  }

  findAll() {
    return `Это действие возвращает весь альбом`;
  }

  findOne(id: number) {
    return `Это действие возвращает #${id} album`;
  }

  update(id: number, updateAlbumDto: UpdateAlbumDto) {
    return `Это действие обновляет #${id} album`;
  }

  remove(id: number) {
    return `Это действие удаляет #${id} album`;
  }

  // ^^ ДОП.МТД.
  // поиск по исполнителю
  async searchByAuthor(author: string): Promise<AlbumEntity[]> {
    return this.albumsRepository.find({ where: { author: author } });
  }

  // поиск по назв.альбома
  async searchByAlbumName(album: string): Promise<AlbumEntity[]> {
    return this.albumsRepository.find({ where: { album: album } });
  }
}
