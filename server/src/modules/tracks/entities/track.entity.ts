// ^ табл.>хран.данн.<tracks(муз.треки,книги,звуки,медиа)

import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';
import { FileEntity } from '../../files/entities/file.entity';
import { AlbumEntity } from '../../albums/entities/album.entity';
import { ReactionEntity } from '../../reactions/entities/reaction.entity';

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

  // Жанр
  @Column({ length: 50, nullable: true })
  @ApiProperty({ example: 'Rock', description: 'Жанр Трека' })
  genre: string;

  // Текст песни
  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'Это моя песня...', description: 'Текст Трека' })
  lyrics: string;

  // Кол-во Прослушиваний
  @Column({ nullable: true })
  @ApiProperty({ example: 0, description: 'Количество прослушиваний Трека' })
  listens: number;

  // Длительность Трека
  @Column({ nullable: true })
  @ApiProperty({
    example: 180,
    description: 'Продолжительность Трека в секундах',
  })
  duration: number;

  // у Мн.Треков Один Польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.tracks)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Пользователь, загрузивший Треки',
  })
  user: UserEntity;

  // связь 1 к 1. У Одного Трека Один Файл
  @OneToOne(() => FileEntity, (file: FileEntity) => file.track)
  @JoinColumn({ name: 'fileId' }) // Указываем имя столбца для связи
  @ApiProperty({
    type: () => FileEntity,
    description: 'Файл Трека',
  })
  file: FileEntity;

  // у Мн.треков Одна обложка. Ссылк.изо Трека
  @ManyToOne(() => FileEntity, (file: FileEntity) => file.tracksCover)
  @ApiProperty({
    type: () => FileEntity,
    description: 'Обложка Треков',
  })
  coverArt: FileEntity | null;

  // Мн.Треков в 1ом Алб <> во Мн.Алб-ах один Трек
  @ManyToMany(() => AlbumEntity, (album: AlbumEntity) => album.tracks)
  @JoinTable({
    // откл. нет нужды настр.второстеп.табл.
    // назв.связ.табл., стлолбцы/ссылки владельца/обратного
    // name: 'album_track',
    // joinColumn: { name: 'trackId', referencedColumnName: 'id' },
    // inverseJoinColumn: { name: 'albumId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => AlbumEntity,
    isArray: true,
    description: 'Альбомы с Треками',
  })
  albums: AlbumEntity[];

  // у Трека Мн.реакций.
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
  createdAt?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
