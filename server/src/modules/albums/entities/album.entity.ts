import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';
import { FileEntity } from '../../files/entities/file.entity';
import { TrackEntity } from '../../tracks/entities/track.entity';
import { ReactionEntity } from '../../reactions/entities/reaction.entity';

@Entity({ name: 'albums', schema: 'public' })
export class AlbumEntity {
  // id, назв.альбома, автор, ссылк.изо обложки трека, масс.треков
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({ description: 'Уникальный идентификатор Альбома' })
  id: number;

  @Column({ length: 100, nullable: false })
  @ApiProperty({ example: 'Мой Альбом', description: 'Название Альбома' })
  title: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ example: 'Иван Иванов', description: 'Авторы Альбома' })
  author: string;

  // объед.Жанры всех Треков одного Альбома
  @Column({ length: 255, nullable: true })
  @ApiProperty({ example: 'Rock | Metal', description: 'Жанры Альбома' })
  genres: string;

  // Год выпуска
  @Column({ nullable: true })
  @ApiProperty({ example: 2000, description: 'Год выпуска Альбома' })
  year: number;

  // Описание Альбома, необязательно
  @Column({ nullable: true })
  @ApiProperty({ description: 'Описание Альбома' })
  description: string;

  // общ.Кол-во.всех Треков одного Альбома
  @Column({ default: 1 /* , name: 'total_track' */ })
  @ApiProperty({ description: 'Количество Треков в Альбоме' })
  total_tracks /* totalTracks */ : number;

  // общ.Длительность всех Треков одного Альбома
  @Column({ default: '00:00:00' /* 0 */, name: 'total_duration' })
  @ApiProperty({ description: 'Длительность Треков в Альбоме' })
  total_duration /* totalDuration */ : /* number */ string;

  // у Мн.Альбомов Один Польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.albums)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Пользователь, загрузивший Альбомы',
  })
  user: UserEntity;

  // у Мн.треков Одна обложка. Ссылк.изо Трека
  @ManyToOne(() => FileEntity, (file: FileEntity) => file.albumsCover)
  @ApiProperty({
    type: () => FileEntity,
    description: 'Обложка Альбомов',
  })
  coverArt: FileEntity | null;

  // у Альбома Мн.Треков <> Трек может быть во Мн.Альбомах
  @ManyToMany(() => TrackEntity, (track: TrackEntity) => track.albums)
  // ! без JoinTable не созд.доп.табл. album_track
  @JoinTable({
    // ! c JoinTable И БЕЗ внутр.настр.(name,joinColumn,inverseJoinColumn) созд.доп.табл. tracks_albums_albums
    name: 'album_track',
    joinColumn: { name: 'albumId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'trackId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    description: 'Треки в Альбомах',
  })
  tracks: TrackEntity[];

  // у Алб.Мн.Реакций
  @OneToMany(
    () => ReactionEntity,
    (reaction: ReactionEntity) => reaction.reactionType === 'album',
  )
  @ApiProperty({
    type: () => ReactionEntity,
    isArray: true,
    description: 'Реакции на Альбом',
  })
  reactions: ReactionEntity[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
