import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
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

  // Текст Реакции
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
    description: 'Реакции от Пользователя',
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
  @Column()
  @ApiProperty({
    example: 12,
    description: 'ID объекта Реакции',
  })
  reactionId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
