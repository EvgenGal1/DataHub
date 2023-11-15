import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // OneToOne,
  ManyToOne,
} from 'typeorm';

import { TrackEntity } from './track.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column()
  text: string;

  // связь табл. Мн.к 1му. У Мн.комм. Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.comments)
  user: UserEntity;

  // связь табл. Мн.к 1му. У Мн.комм. Один трек
  @ManyToOne(() => TrackEntity, (track: TrackEntity) => track.comments)
  track: TrackEntity;
}
