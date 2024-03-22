import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { TrackEntity } from '../../tracks/entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { FileEntity } from 'src/files/entities/file.entity';

@Entity({ name: 'albums', schema: 'public' })
export class AlbumEntity {
  // id, назв.альбома, автор, ссылк.изо обложки трека, масс.треков
  @PrimaryColumn()
  id: number;

  // Назв.Альбома
  @Column({ default: 'Название альбома' })
  title: string;

  // Автор
  @Column({ default: 'Автор альбома 1' })
  author: string;

  // год выпуска
  @Column({ default: null })
  year: number;

  // связь табл. 1 к 1. У Одного альбома Одна обложка (с обязат. tracks.fileID)
  @ApiProperty({ example: '/images/albums', description: 'путь' })
  @Column({ default: '/images/albums/заглушка.jpg', nullable: true })
  path: string;

  // связь табл. 1 к 1. У Одной обложки Один файл альбома (с опцион.указ. albums.coverID)
  @OneToOne(() => FileEntity, (files: FileEntity) => files.album, {
    nullable: true,
  })
  @JoinColumn()
  cover: File;

  // связь табл. 1го ко Мн. У Одного альбома Мн.треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.album)
  //  возвращ.масс.треков
  tracks: TrackEntity[];

  // связь табл. Мн.к 1му. У Мн.альбомов Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.albums)
  user: UserEntity;

  // объед.жанры всех Треков одного Альбома
  @Column({ default: 'Other #', nullable: true })
  styles: string;

  // общ.кол-во.всех Треков одного Альбома
  @Column({ default: 1 })
  total_tracks: number;

  // общ.длительность всех Треков одного Альбома
  @Column({ default: '0:00' })
  total_duration: string;

  // описание Альбома, необязательно
  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  startDate?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
