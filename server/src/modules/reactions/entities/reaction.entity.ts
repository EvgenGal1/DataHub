import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { TrackEntity } from 'src/modules/tracks/entities/track.entity';
import { AlbumEntity } from 'src/modules/albums/entities/album.entity';

@Entity({ name: 'reactions', schema: 'public' })
export class ReactionEntity {
  // id, текст, оценка, id.user, тип объ, id объ
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({ description: 'Уникальный идентификатор Реакции' })
  id: number;

  // Текст Реакции
  @Column({ nullable: true, length: 1500 })
  @ApiProperty({ example: 'Мне нравится трек!', description: 'Текст Реакции' })
  comment?: string;

  // Оценка Реакции (например, от 1 до 5)
  @Column({ nullable: true })
  @ApiProperty({ example: 5, description: 'Оценка Реакции' })
  rating?: number;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.reactions)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Реакции от Пользователя',
  })
  user: UserEntity;

  // ^ Общ.Реакции > всех Сущностей  :  + меньш.стлбц.,просто добав.нов.табл.  - сложн.req,меньш.типов
  // ID Сущности на который оставлена Реакция
  // @Column()
  // @ApiProperty({ example: 123, description: 'ID Сущности Реакции', })
  // entityId: number;
  // Тип Сущности Рекации: 'track', 'album', 'file'
  // @Column({ length: 10 })
  // @ApiProperty({ example: 'track', description: 'Тип Сущности Реакция', })
  // entityType: 'track' | 'album' | 'file';

  // ^ Раздел.Реакция > кажд. Сущности  :  + строг.типы, прост.req,  - мн.стлбц., добавл.нов.связи
  @ManyToOne(() => FileEntity, (file: FileEntity) => file.reactions)
  @ApiProperty({ type: () => FileEntity, description: 'Файл с Реакцией' })
  file?: FileEntity;
  @ManyToOne(() => TrackEntity, (track: TrackEntity) => track.reactions)
  @ApiProperty({ type: () => TrackEntity, description: 'Трек с Реакцией' })
  track?: TrackEntity;
  @ManyToOne(() => AlbumEntity, (album: AlbumEntity) => album.reactions)
  @ApiProperty({ type: () => AlbumEntity, description: 'Альбом с Реакцией' })
  album?: AlbumEntity;

  // Реакция на Реакцию
  @ManyToOne(() => ReactionEntity, (reaction) => reaction.childReactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({
    type: () => ReactionEntity,
    description: 'Родительская Реакция (если это Реакция на Реакцию)',
  })
  parentReaction?: ReactionEntity;

  // Реакции на эту Реакцию
  @OneToMany(() => ReactionEntity, (reaction) => reaction.parentReaction, {
    cascade: true,
  })
  @ApiProperty({
    type: () => [ReactionEntity],
    description: 'Дочерние Реакции (если эта Реакция имеет ответы))',
  })
  childReactions?: ReactionEntity[];

  //  ----------------------------------------------------------------------------------

  // Метод для приведения ID к UUID(защит.от коллизии) > entityId: string и остальных ID через PrimaryColumn
  // addReaction(postId: number) {
  //   this.entityId = uuidv4(); // Генерация нового уникального идентификатора для реакции
  //   this.postId = postId; // Заполнение стандартным идентификатором поста
  // }

  @CreateDateColumn({ name: 'createdAt' })
  createdAt?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;

  // ^^ прописать совместную таблицу под лайки, комменты, реакции. Подтягивать только то что нужно к запросу.
  // Например на один трек от 3х user может быть по 3 лайка, коммента, репоста и это займёт только 3 строчки в данн.табл.
  // При подтяг.данн. раскидывать res по местам
}
