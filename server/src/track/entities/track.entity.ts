// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.User)
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  PrimaryColumn,
  OneToOne,
} from 'typeorm';

import { UserEntity } from 'src/users/entities/user.entity';
import { CommentEntity } from './comment.entity';
import { AlbumEntity } from 'src/album/entities/album.entity';
import { FileEntity } from 'src/files/entities/file.entity';

@Entity('track')
export class TrackEntity {
  // id, назв.трека, имя артиста, текст трека, кол-во прослушиваний, ссылк.изо обложки трека, ссылк.аудио, связь с.польз., масс.комментов
  // @PrimaryGeneratedColumn() // коммит чтоб указ.свободный id ч/з fn getSmallestAvailableId
  @PrimaryColumn()
  id: number;

  @Column({ default: 'назв.трека #' })
  name: string;

  @Column({ default: 'Аффтор' })
  artist: string;

  @Column({ default: '-', length: 500 })
  text: string;

  @Column({ default: 0 })
  listens: number;

  @Column({ default: '_#_' })
  picture: string;

  @Column({ default: 'mpt3/wav' })
  audio: string;

  // ^^ добав.: стиль, продолжительность
  // Стиль Трека
  @Column({ default: 'Rock' })
  style: string;

  // продолжительность
  @Column({ default: 180 })
  duration: number;

  // у трека один файл с target.album
  @OneToOne(() => FileEntity, (file: FileEntity) => file.track)
  file: FileEntity;

  // связь табл. Мн.к 1му. У Мн.треков Один альбом.
  @ManyToOne(() => AlbumEntity, (album: AlbumEntity) => album.tracks)
  album: AlbumEntity;
  // ^^ дораб.до ManyToMany (у альбоиа много треков, трек может быть в разн.альбомах)

  // связь табл. Мн.к 1му. У Мн.треков Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.tracks)
  user: UserEntity;

  // связь табл. Мн.ко Мн. У Мн.треков Мн.комм.
  @ManyToMany(() => CommentEntity, (comment: CommentEntity) => comment.track)
  comments: CommentEntity[];
}
