import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // OneToOne,
  ManyToOne,
} from 'typeorm';
import { TrackEntity } from './track.entity';

// декоратор для соед.с БД
@Entity('comment')
export class CommentEntity {
  // декоратор для авто.генер.id
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // track_id: string;

  @Column()
  author: string;

  @Column()
  username: string;

  @Column()
  text: string;

  // связь табл. Мн.к 1му. У Мн.данн.(коментов) Одна привязка (Один трек)
  // каждый комментарий принадлежит только одному треку
  @ManyToOne(() => TrackEntity, (track: TrackEntity) => track.comments)
  track: TrackEntity;
}
