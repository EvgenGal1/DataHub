import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { TrackEntity } from '../../tracks/entities/track.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { FileEntity } from '../../files/entities/file.entity';
import { ReactionEntity } from 'src/modules/reactions/entities/reaction.entity';

@Entity({ name: 'albums', schema: 'public' })
export class AlbumEntity {
  // id, назв.альбома, автор, ссылк.изо обложки трека, масс.треков
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({ description: 'Уникальный идентификатор Альбома' })
  id: number;

  @Column({ length: 100, nullable: false })
  @ApiProperty({ example: 'Мой Альбом', description: 'Название Альбома' })
  title: string;

  // Автор
  @Column({ length: 255, nullable: true })
  @ApiProperty({ example: 'Иван Иванов', description: 'Авторы Альбома' })
  author: string;

  // объед.жанры всех Треков одного Альбома
  @Column({ length: 255, nullable: true })
  @ApiProperty({ example: 'Rock | Metal', description: 'Жанры Альбома' })
  genres: string;

  // год выпуска
  @Column({ nullable: true })
  @ApiProperty({ example: 2000, description: 'Год выпуска Альбома' })
  year: number;

  // описание Альбома, необязательно
  @Column({ nullable: true })
  @ApiProperty({ description: 'Описание Альбома' })
  description: string;

  // общ.кол-во.всех Треков одного Альбома
  @Column({ default: 1 /* , name: 'total_track' */ })
  @ApiProperty({ description: 'Количество Треков в Альбоме' })
  total_tracks /* totalTracks */ : number;

  // общ.длительность всех Треков одного Альбома
  @Column({ default: '0:00' /* 0 */, name: 'total_duration' })
  @ApiProperty({ description: 'Длительность Треков в Альбоме' })
  total_duration /* totalDuration */ : /* number */ string;

  // У Мн.Альбомов Один Польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.uploadedAlbums)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Пользователь, загрузивший Альбом',
  })
  uploadedBy: UserEntity;

  // Мн.ко Мн. Мн.Файлов Обложек у Одного Альбома  <>  Файл Альбома (заглушка) > Мн.Албомов
  @ManyToMany(() => FileEntity, (file: FileEntity) => file.albums)
  @JoinTable({
    name: 'album_cover',
    joinColumn: { name: 'albumId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fileId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => FileEntity,
    isArray: true,
    description: 'Обложки Альбома',
  })
  covers: FileEntity[];

  // Мн.ко Мн. Один Файл Трека мб в Мн.Альбомах  <>  Мн.Файлов Треков мб в Одном Альбоме
  @ManyToMany(() => FileEntity, (file: FileEntity) => file.albums)
  @JoinTable({
    name: 'album_file',
    joinColumn: { name: 'albumId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fileId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => FileEntity,
    isArray: true,
    description: 'Файлы, связанные с Альбомом',
  })
  files: FileEntity[];

  // ^ Мн.ко Мн. У Альбома Мн.Треков, Трек может быть во Мн.Альбомах
  @ManyToMany(() => TrackEntity, (track: TrackEntity) => track.albums)
  @JoinTable({
    name: 'album_track',
    joinColumn: { name: 'albumId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'trackId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    description: 'Треки, связанные с Альбомом',
  })
  tracks: TrackEntity[];

  // у Алб.Мн. Реакций
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
  startDate?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
