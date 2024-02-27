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

import { TrackEntity } from '../../tracks/entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { FileEntity } from 'src/files/entities/file.entity';

@Entity('albums')
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
  @Column({ default: '199_' })
  year: string;

  // общ.стиль Треков
  @Column({ default: 'rock, metal, rap' })
  style: string;

  // связь табл. 1 к 1. У Одного альбома Одна обложка (с опцион.указ. file.albumID)
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

  // ^^ доп.на будущее
  // стлб. total_tracks (общее количество треков в альбоме)
  // стлб. description (описание альбома)
  // стили музыки (загр.все стили track; чтоб стили из track для данн.alb подружались ч/з конкатенацию (слэш, тчк.запят.))
  // общ.продолжительность (высчит.из длины всех треков данн.alb общ.длину)

  @CreateDateColumn()
  startDate?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
