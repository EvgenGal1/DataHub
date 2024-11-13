// доп.табл.>хран.общ.данн.ф.<tracks,audios,videos,shemas
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { AlbumEntity } from '../../albums/entities/album.entity';
import { TrackEntity } from '../../tracks/entities/track.entity';
import { UserEntity } from '../../users/entities/user.entity';
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

  // размер в bt
  @Column({ nullable: true })
  @ApiProperty({ example: 1024, description: 'Размер Файла в байтах' })
  size?: number;

  // путь (images/album)
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

  // связь табл. 1 к 1. Один файл указ.на Один трек (с опцион.указ. files.track)
  @OneToOne(() => TrackEntity, (track: TrackEntity) => track.file, {
    nullable: true,
  })
  @ApiProperty({
    type: () => TrackEntity,
    description: 'Трек данного Файла',
  })
  track: TrackEntity | null;

  // У Обложки (заглушки) Мн.Треков. Ссылк.изо трека
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.cover)
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    description: 'Треки содержащие Файл Обложки',
  })
  tracksCover: TrackEntity[];

  // Мн.ко Мн. Один Файл Трека мб в Мн.Альбомах  <>  Мн.Файлов Треков мб в Одном Альбоме
  @ManyToMany(() => AlbumEntity, (album: AlbumEntity) => album.files)
  @JoinTable({
    // Название таблицы для связи
    name: 'album_file',
    joinColumn: { name: 'fileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'albumId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => AlbumEntity,
    isArray: true,
    description: 'Альбомы, содержащие Файл Трека',
  })
  albums: AlbumEntity[];

  // У Мн.Файлов Один Польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.uploadedFiles)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Пользователь, загрузивший Файл',
  })
  uploadedBy: UserEntity;

  // Мн.ко Мн. Один Файл Аватара (заглушка) мб > Мн.Users  <>  Мн. Файлов Аватар мб у Одного User
  @ManyToMany(() => UserEntity, (user: UserEntity) => user.avatars)
  @ApiProperty({
    type: () => UserEntity,
    isArray: true,
    description: 'Пользователи, использующие Файл как аватар',
  })
  avatars: UserEntity[];

  // У Файла Мн.Реакций
  @OneToMany(
    () => ReactionEntity,
    (reaction: ReactionEntity) => reaction.reactionType === 'file',
  )
  @ApiProperty({
    type: () => ReactionEntity,
    isArray: true,
    description: 'Реакции на Файл',
  })
  reactions: ReactionEntity[];

  // декор.созд.
  @CreateDateColumn({ name: 'createdAt' })
  startDate?: Date;

  // декор.поментки удаления (без удаления)
  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
