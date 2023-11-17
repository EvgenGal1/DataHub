import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // OneToOne,
  ManyToOne,
} from 'typeorm';

import { TrackEntity } from './track.entity';
import { UserEntity } from 'src/users/entities/user.entity';

// ^^ обдумать созд.отд. CommetModule (коммент.,лайк,кол-во кажд.)
@Entity('comment')
export class CommentEntity {
  // id, текст коммент, id.user, id.track
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'коммент #' })
  text: string;

  // связь табл. Мн.к 1му. У Мн.комм. Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.comments)
  user: UserEntity;

  // связь табл. Мн.к 1му. У Мн.комм. Один трек
  @ManyToOne(() => TrackEntity, (track: TrackEntity) => track.comments)
  track: TrackEntity;
}
