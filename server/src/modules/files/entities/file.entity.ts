// ^ доп.табл.>хран.общ.данн.ф.<tracks,audios,videos,shemas

import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';
import { TrackEntity } from '../../tracks/entities/track.entity';
import { AlbumEntity } from '../../albums/entities/album.entity';
import { ReactionEntity } from '../../reactions/entities/reaction.entity';

@Entity({ name: 'files', schema: 'public' })
export class FileEntity {
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({
    description: 'Уникальный идентификатор Файла',
  })
  id: number;

  // сгенер.назв.Трека (ч/з f.cntrl > fileStorage.filename)
  @Column({ length: 255, nullable: false })
  @ApiProperty({ example: 'my-file.jpg', description: 'Название Файла' })
  fileName: string;

  // Размер в bt
  @Column({ nullable: true })
  @ApiProperty({ example: 1024, description: 'Размер Файла в байтах' })
  size?: number;

  // Путь (images/album)
  @Column({ length: 500 })
  @ApiProperty({ example: '/images/my-file.jpg', description: 'Путь к Файлу' })
  path: string;

  // mimeType ф.
  @Column({ length: 50 })
  @ApiProperty({
    example: 'image/jpeg',
    description: 'Тип Файла (например, image/jpeg, audio/mp3 и т.д.)',
  })
  mimeType: string;

  // связь табл. 1 к 1. Один Файл указ.на Один Трек (с опцион.указ. files.track)
  @OneToOne(() => TrackEntity, (track: TrackEntity) => track.file, {
    nullable: true,
  })
  @ApiProperty({
    type: () => TrackEntity,
    description: 'Трек Файла',
  })
  track: TrackEntity | null;

  // у Аватара (заглушки) Мн.Пользователей. Общ.связь coverArt в user,track,album > - лишн.столбца в file
  @OneToMany(() => UserEntity, (user: UserEntity) => user.coverArt)
  @ApiProperty({
    type: () => UserEntity,
    isArray: true,
    description: 'Пользователи с Аватаром',
  })
  userAvatar: UserEntity[];

  // у Обложки (заглушки) Мн.Треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.coverArt)
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    description: 'Треки с Обложкой',
  })
  tracksCover: TrackEntity[];

  // у Обложки (заглушки) Мн.Альбомов
  @OneToMany(() => AlbumEntity, (album: AlbumEntity) => album.coverArt)
  @ApiProperty({
    type: () => AlbumEntity,
    isArray: true,
    description: 'Альбомы с Обложкой',
  })
  albumsCover: AlbumEntity[];

  // у Мн.Файлов Один Польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.files)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Пользователь, загрузивший Файлы',
  })
  user: UserEntity;

  // у Файла Мн.Реакций
  @OneToMany(() => ReactionEntity, (reaction: ReactionEntity) => reaction.file)
  @ApiProperty({
    type: () => ReactionEntity,
    isArray: true,
    description: 'Реакции на Файл',
  })
  reactions: ReactionEntity[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
