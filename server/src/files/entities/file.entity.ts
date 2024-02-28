import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  // JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  // PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { AlbumEntity } from 'src/albums/entities/album.entity';
import { TrackEntity } from 'src/tracks/entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';

// типизация (Query парам.ч/з enum. и др.вар.) Filter ф.по фото и trash`мусор`
export enum FileType { // ^^ возм. стоит завести FileTarget с типами IMAGE = 'IMAGE', и т.д.
  IMAGE = 'image',
  ALBUM = 'album',
  AVATAR = 'avatar',
  PHOTO = 'photo',
  PERSONAL = 'personal',
  AUDIO = 'audio',
  BOOK = 'books',
  FILE = 'files',
  PROSE = 'prose',
  CODE = 'code',
  SCHEME = 'scheme',
  BLUEPRINT = 'blueprint',
  TRASH = 'trash',
  OTHER = 'other',
}

// `разрешенные типы файлов` для мтд.масс.
export const fileTypesAllowed = [
  'all',
  'image',
  'album',
  'avatar',
  'photo',
  'personal',
  'audio',
  'books',
  'files',
  'prose',
  'code',
  'scheme',
  'blueprint',
  'trash',
  'other',
];

@Entity('files')
export class FileEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @ApiProperty({ example: 'назв.трека #', description: 'НАзвание Трека' })
  @Column({ default: 'Документ.' })
  originalname: string;

  // тип (разн.req/res)
  @Column()
  mimetype: string;

  // цель (image/file/album)
  @ApiProperty({ example: 'назв.трека #', description: 'НАзвание Трека' })
  @Column()
  target: string;

  @Column()
  size: number;

  // связь табл. 1го ко Мн. У обложки Мн.треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.cover)
  tracks: TrackEntity[];

  // у файла с target.album один альбом
  // @OneToOne(() => AlbumEntity, (album) => album.fileId)
  // albumId: AlbumEntity;
  // связь табл. 1 к 1. Один файл указ.на Одну обложку (с опцион.указ. album.coverID)
  @OneToOne(() => AlbumEntity, (album) => album.cover, {
    nullable: true,
  })
  // @JoinColumn()
  album: AlbumEntity;
  // ^^ сократить до авто.ID и либо объедин путь из filename + target либо в общ столбе.для путей файлов в БД из др.табл - Albums, Tracks, Books и т.д.
  // ^^ дораб. Сделать связку OneToOne_JoinColumn на табл.Files с отдельным ID у табл. C audioPathID либо 1- сыль на Files.pathID, 2- либо сыль  на авто.ID. Путь либо собирать из filename + target либо совместить в одном поле ~ path(filePath)

  // связь табл. Мн.к 1му. У Мн.файлов Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.files)
  user: UserEntity;

  @CreateDateColumn()
  startDate?: Date;

  // декоратор поментки удаления (без удаления)
  @DeleteDateColumn()
  deletedAt?: Date;
}
