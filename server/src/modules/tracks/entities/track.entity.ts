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
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';
import { ReactionEntity } from '../../reactions/entities/reaction.entity';
import { AlbumEntity } from '../../albums/entities/album.entity';
import { FileEntity } from '../../files/entities/file.entity';

@Entity({ name: 'tracks', schema: 'public' })
export class TrackEntity {
  // id, назв.трека, имя артиста, текст трека, кол-во прослушиваний, ссылк.изо обложки трека, ссылк.аудио, связь с.польз., масс.реакций
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({ description: 'Уникальный идентификатор Трека' })
  id: number;

  @Column({ length: 100, nullable: false })
  @ApiProperty({ example: 'Моя песня', description: 'Название Трека' })
  title: string;

  @Column({ length: 100, nullable: true })
  @ApiProperty({ example: 'Иван Иванов', description: 'Автор Трека' })
  author: string;

  @Column({ length: 50, nullable: true })
  @ApiProperty({ example: 'Rock', description: 'Жанр Трека' })
  genre: string;

  // текст песни
  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'Это моя песня...', description: 'Текст Трека' })
  lyrics: string;

  // кол-во прослушиваний
  @Column({ nullable: true })
  @ApiProperty({ example: 123, description: 'Количество прослушиваний Трека' })
  listens: number;

  // длительность Трека
  @Column({ nullable: true })
  @ApiProperty({
    example: 180,
    description: 'Продолжительность Трека в секундах',
  })
  duration: number;

  // У Мн.Треков Один Польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.uploadedTracks)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Пользователь, загрузивший Трек',
  })
  uploadedBy: UserEntity;

  // связь 1 к 1. У Одного трека Один файл
  @OneToOne(() => FileEntity, (file: FileEntity) => file.track)
  // Используется для управления именами столбцов в базе данных
  @JoinColumn()
  @ApiProperty({
    type: () => FileEntity,
    description: 'Файл, связанный с Треком',
  })
  file: FileEntity;

  // У Мн.треков Одна обложка. Ссылк.изо Трека
  @ManyToOne(() => FileEntity, (file: FileEntity) => file.tracksCover)
  @ApiProperty({
    type: () => FileEntity,
    description: 'Обложка Трека',
  })
  cover: FileEntity | null;

  // Мн Треков в 1ом Алб и в разн.Алб-ах один трек
  @ManyToMany(() => AlbumEntity, (album: AlbumEntity) => album.tracks)
  @JoinTable({
    name: 'album_track',
    joinColumn: { name: 'trackId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'albumId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => AlbumEntity,
    isArray: true,
    description: 'Альбомы, связанные с Треком',
  })
  albums: AlbumEntity[];

  // У трека Мн.реакций.
  @OneToMany(
    () => ReactionEntity,
    (reaction: ReactionEntity) => reaction.reactionType === 'track',
  )
  @ApiProperty({
    type: () => ReactionEntity,
    isArray: true,
    description: 'Реакции на Трек',
  })
  reactions: ReactionEntity[];

  @CreateDateColumn({ name: 'createdAt' })
  startDate?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
