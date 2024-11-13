import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  ManyToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'reactions', schema: 'public' })
export class ReactionEntity {
  // id, текст, оценка, id.user, тип объ, id объ
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({ description: 'Уникальный идентификатор Реакции' })
  id: number;

  // Поле для текста Реакции
  @Column({ nullable: true, length: 500 })
  @ApiProperty({
    example: 'Мне очень понравился этот трек!',
    description: 'Текст Реакции',
  })
  text?: string;

  // Оценка Реакции (например, от 1 до 5)
  @Column({ nullable: true })
  @ApiProperty({ example: 5, description: 'Оценка Реакции' })
  rating?: number;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.reactions)
  @ApiProperty({
    type: () => UserEntity,
    description: 'Пользователь, оставивший Реакцию',
  })
  user: UserEntity;

  // Тип рекации: 'track', 'album', 'file'
  @Column({ length: 10 })
  @ApiProperty({
    example: 'track',
    description: 'Тип объекта Реакция',
  })
  reactionType: 'track' | 'album' | 'file';

  // ID объекта на который оставлена Реакция
  @Column(/* { type: 'uuid' } */)
  @ApiProperty({
    example: 12,
    description: 'ID объекта Реакции',
  })
  reactionId: /* string */ number;

  // Метод для приведения ID к UUID(защит.от коллизии) > reactionId: string и остальных ID через PrimaryColumn
  // addReaction(postId: number) {
  //   this.reactionId = uuidv4(); // Генерация нового уникального идентификатора для реакции
  //   this.postId = postId; // Заполнение стандартным идентификатором поста
  // }

  @CreateDateColumn({ name: 'createdAt' })
  startDate?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;

  // ^^ прописать совместную таблицу под лайки, комменты, реакции. Подтягивать только то что нужно к запросу.
  // Например на один трек от 3х user может быть по 3 лайка, коммента, репоста и это займёт только 3 строчки в данн.табл.
  // При подтяг.данн. раскидывать res по местам
}
