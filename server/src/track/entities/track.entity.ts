import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';

import { UserEntity } from 'src/users/entities/user.entity';
import { CommentEntity } from './comment.entity';

@Entity('track')
export class TrackEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  artist: string;

  @Column({ default: '-' })
  text: string;

  @Column({ default: 0 })
  listens: number;

  @Column({ default: '_' })
  picture: string;

  @Column()
  audio: string;

  // связь табл. Мн.к 1му. У Мн.треков Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.tracks)
  user: UserEntity;

  // связь табл. Мн.ко Мн. У Мн.треков Мн.комм.
  @ManyToMany(() => CommentEntity, (comment: CommentEntity) => comment.track)
  comments: CommentEntity[];
}
