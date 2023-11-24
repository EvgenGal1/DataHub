import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AlbumEntity } from 'src/album/entities/album.entity';
import { TrackEntity } from 'src/track/entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';

// типизация Query парам.ч/з enum. Filter ф.по фото и trash`мусор`
export enum FileType {
  PHOTOS = 'photos',
  TRASH = 'trash',
  AUDIO = 'audio',
  IMAGE = 'image',
}

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  originalname: string;

  @Column()
  size: number;

  // тип (разн.req/res)
  @Column()
  mimetype: string;

  // цель (image/file/album)
  @Column()
  target: string;

  // у файла с target.album один трек
  @OneToOne(() => TrackEntity, (track) => track.file)
  track: TrackEntity;

  // у файла с target.album один альбом
  @OneToOne(() => AlbumEntity, (album) => album.file)
  album: AlbumEntity;

  // связь табл. Мн.к 1му. У Мн.файлов Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.files)
  user: UserEntity;

  // декоратор поментки удаления (без удаления)
  @DeleteDateColumn()
  deletedAt?: Date;
}
