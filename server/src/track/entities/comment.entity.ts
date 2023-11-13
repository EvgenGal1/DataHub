import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
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
  @ManyToOne(() => TrackEntity, (track: TrackEntity) => track.comments)
  // связка табл. 1к1му. У 1го коммент Одни привязка(трек)
  // @OneToOne(() => TrackEntity, (track: TrackEntity) => track.id)
  track: TrackEntity;

  // @Prop({type: [{type: ...Shema.ObjId, ref: 'Track'}]})
  // track: Track

  // @Column()
  // name: string;

  // @Column()
  // author: string;

  // @Column()
  // picture: string;

  // @Column()
  // tracks: string;
}
