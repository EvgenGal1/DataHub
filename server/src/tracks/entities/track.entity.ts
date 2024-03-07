// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.Tracks)
// табл.>хран.данн.<tracks(муз.треки,книги,звуки,медиа)
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// import { AbstractEntity } from 'src/model/abstract.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { AlbumEntity } from 'src/albums/entities/album.entity';
import { FileEntity } from 'src/files/entities/file.entity';

@Entity({ name: 'tracks', schema: 'public' })
export class TrackEntity /* extends AbstractEntity */ {
  // id, назв.трека, имя артиста, текст трека, кол-во прослушиваний, ссылк.изо обложки трека, ссылк.аудио, связь с.польз., масс.реакций
  // @PrimaryGeneratedColumn() // коммит чтоб указ.свободный id ч/з fn getSmallestIDAvailable
  @PrimaryColumn()
  id: number;

  @ApiProperty({ example: 'назв.трека #', description: 'НАзвание Трека' })
  @Column({ default: 'назв.трека #' })
  name: string;

  @ApiProperty({ example: 'Аффтор', description: 'Исполнитель Трека' })
  @Column({ default: 'Аффтор' })
  artist: string;

  @ApiProperty({ example: './audios/track', description: 'путь' })
  @Column({ default: './audios' })
  path: string;

  @ApiProperty({ example: '-', description: 'Текст Трека' })
  @Column({ type: 'varchar', default: '-', length: 500 })
  text: string;

  // кол-во прослушиваний
  @Column({ default: 0 })
  listens: number;

  // стиль трека
  @ApiProperty({ example: 'Other', description: 'Стиль Трека' })
  @Column({ default: 'Other' })
  style: string;

  // продолжительность
  @Column({ type: 'text', default: 180 })
  duration: number | string;

  // связь табл. 1 к 1. У Одного трека Один файл (с обязат. tracks.fileID)
  @OneToOne(() => FileEntity, (files: FileEntity) => files.track, {
    nullable: false,
  })
  @JoinColumn()
  file: FileEntity;

  // связь табл. 1го ко Мн. У трека Мн.реакций.
  @OneToMany(() => ReactionEntity, (reaction: ReactionEntity) => reaction.track)
  reactions: ReactionEntity[];

  // связь табл. Мн.к 1му. У Мн.треков Одна обложка. Ссылк.изо обложки (с опцион.указ. tracks.coverID)
  @ManyToOne(() => FileEntity, (files: FileEntity) => files.cover, {
    nullable: true,
  })
  cover: FileEntity;

  // связь табл. Мн.к 1му. У Мн.треков Один альбом. (с опцион.указ. tracks.albumID)
  @ManyToOne(() => AlbumEntity, (album: AlbumEntity) => album.tracks, {
    nullable: true,
  })
  album: AlbumEntity;

  // связь табл. Мн.к 1му. У Мн.треков Один польз. (с обязат. tracks.userID)
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.tracks, {
    nullable: false,
  })
  user: UserEntity;

  @CreateDateColumn()
  startDate?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
