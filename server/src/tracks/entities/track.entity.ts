// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.User)
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { AbstractEntity } from 'src/model/abstract.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { AlbumEntity } from 'src/albums/entities/album.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tracks')
export class TrackEntity extends AbstractEntity {
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

  @ApiProperty({ example: '-', description: 'Текст Трека' })
  @Column({ type: 'varchar', default: '-', length: 500 })
  text: string;

  // кол-во прослушиваний
  @Column({ default: 0 })
  listens: number;

  // ссылк.аудио
  @Column({ default: 'mpt3/wav' })
  audio: string;

  // стиль трека
  @ApiProperty({ example: 'Other', description: 'Стиль Трека' })
  @Column({ default: 'Other' })
  style: string;

  // продолжительность
  @Column({ type: 'text', default: 180 })
  duration: number | string;

  // связь табл. Мн.к 1му. У Мн.треков Одна обложка. Ссылк.изо обложки
  @ManyToOne(() => FileEntity, (file: FileEntity) => file.tracks, {
    nullable: true,
  })
  cover: FileEntity;

  // связь табл. Мн.к 1му. У Мн.треков Один альбом.
  @ManyToOne(() => AlbumEntity, (album: AlbumEntity) => album.tracks)
  album: AlbumEntity;
  // ?? дораб.до ManyToMany (у альбоиа много треков, трек может быть в разн.альбомах)

  // связь табл. Мн.к 1му. У Мн.треков Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.tracks)
  user: UserEntity;

  // связь табл. 1го ко Мн. У трека Мн.реакций.
  @OneToMany(() => ReactionEntity, (reaction: ReactionEntity) => reaction.track)
  reactions: ReactionEntity[];

  @CreateDateColumn()
  startDate?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
