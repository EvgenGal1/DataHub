// доп.табл.>хран.общ.данн.ф.<tracks,audios,videos,shemas
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
  PICTURE = 'picture',
  AVATAR = 'avatar',
  PHOTO = 'photo',
  PERSONAL = 'personal',
  AUDIO = 'audio',
  TRACK = 'track',
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
  'picture',
  'album',
  'avatar',
  'photo',
  'personal',
  'audio',
  'track',
  'book',
  'file',
  'prose',
  'code',
  'scheme',
  'blueprint',
  'trash',
  'other',
];

@Entity({ name: 'files', schema: 'public' })
export class FileEntity {
  @PrimaryColumn()
  id: number;

  // ориг.назв.Трека
  @ApiProperty({ example: 'назв.трека #', description: 'НАзвание Трека' })
  @Column({ default: 'Документ.' })
  originalname: string;

  // ^^ Путь либо собирать из `filename + target` либо совместить в одном поле ~ path(filePath)
  // сгенер.назв.Трека (в f.cntrl > fileStorage.filename)
  @Column()
  filename: string;

  // цель (image/file/album)
  @ApiProperty({ example: 'назв.трека #', description: 'НАзвание Трека' })
  @Column()
  target: string;

  // размер в bt
  @Column()
  size: number;

  // тип (разн.req/res)
  @Column()
  mimetype: string;

  // связь табл. 1 к 1. Один файл указ.на Один трек (с опцион.указ. files.track)
  @OneToOne(() => TrackEntity, (track: TrackEntity) => track.file, {
    nullable: true,
  })
  track: TrackEntity;

  // связь табл. 1го ко Мн. У Одного файла(заглушка) Мн.альбомов. Ранее OneToMany
  @OneToMany(() => AlbumEntity, (album: AlbumEntity) => album.cover, {
    nullable: true,
  })
  album: AlbumEntity;

  // связь табл. 1го ко Мн. У Одной обложки Мн.треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.cover)
  cover: TrackEntity[];

  // связь табл. Мн.к 1му. У Мн.файлов Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.files)
  user: UserEntity;

  // декор.созд.
  @CreateDateColumn()
  startDate?: Date;

  // декор.поментки удаления (без удаления)
  @DeleteDateColumn()
  deletedAt?: Date;
}
