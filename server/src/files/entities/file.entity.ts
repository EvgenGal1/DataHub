import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  // PrimaryGeneratedColumn,
} from 'typeorm';

import { AlbumEntity } from 'src/album/entities/album.entity';
import { TrackEntity } from 'src/track/entities/track.entity';
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
}

@Entity('files')
export class FileEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  originalname: string;

  // тип (разн.req/res)
  @Column()
  mimetype: string;

  // цель (image/file/album)
  @Column()
  target: string;

  @Column()
  size: number;

  // у файла с target.album один трек
  @OneToOne(() => TrackEntity, (track) => track.file)
  track: TrackEntity;

  // у файла с target.album один альбом
  @OneToOne(() => AlbumEntity, (album) => album.file)
  album: AlbumEntity;

  // связь табл. Мн.к 1му. У Мн.файлов Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.files)
  user: UserEntity;

  @CreateDateColumn()
  startDate?: Date;

  // декоратор поментки удаления (без удаления)
  @DeleteDateColumn()
  deletedAt?: Date;
}
