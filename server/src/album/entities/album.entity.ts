import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { TrackEntity } from '../../track/entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { FileEntity } from 'src/files/entities/file.entity';

@Entity('album')
export class AlbumEntity {
  // id, назв.альбома, автор, ссылк.изо обложки трека, масс.треков
  @PrimaryGeneratedColumn()
  id: number;

  // Назв.Альбома
  @Column({ default: 'Название альбома' })
  album: string;

  // Автор
  @Column({ default: 'Автор альбома 1' })
  author: string;

  // обложка
  @Column({ default: '_#_' })
  picture: string;

  // год выпуска
  @Column({ default: '199_' })
  year: string;

  // общ.стиль Треков
  @Column({ default: '199_' })
  style: string;

  // ^^ завести методы для:
  // стили музыки (загр.все стили track; чтоб стили из track для данн.alb подружались ч/з конкатенацию (слэш, тчк.запят.))
  // общ.продолжительность (высчит.из длины всех треков данн.alb общ.длину)

  // связь табл. 1го ко Мн. У альбома Мн.треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.album)
  //  возвращ.масс.треков
  tracks: TrackEntity[];

  // у альбома один файла с target.album
  @OneToOne(() => FileEntity, (files: FileEntity) => files.album)
  file: FileEntity;

  // связь табл. Мн.к 1му. У Мн.альбомов Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.albums)
  user: UserEntity;
}
