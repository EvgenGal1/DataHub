import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { TrackEntity } from '../../track/entities/track.entity';

@Entity('album')
export class AlbumEntity {
  // id, назв.альбома, автор, ссылк.изо обложки трека, масс.треков
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Название альбома' })
  name: string;

  @Column({ default: 'Автор альбома 1' })
  author: string;

  @Column({ default: '_#_' })
  picture: string;

  // связь табл. 1го ко Мн. У альбома Мн.треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.album)
  //  возвращ.масс.треков
  tracks: TrackEntity[];
}
