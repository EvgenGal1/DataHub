import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { CommentEntity } from './comment.entity';

// декоратор для соед.с БД
@Entity('track')
export class TrackEntity {
  // декоратор для авто.генер.id
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  artist: string;

  @Column()
  test: string;

  @Column()
  listens: number;

  @Column()
  picture: string;

  @Column()
  audio: string;

  // @OneToMany(() => CommentEntity, (comment: CommentEntity) => comment.track)
  // comments: CommentEntity[];

  // связь табл. 1го ко Мн. У Одного(трека) Мн.данн.(коммент). 1ый аргум.аноним.fn (табл.обращения - CommentEntity), 2ый парам.получ.данн.и обратн.связь
  @OneToMany(() => CommentEntity, (comment: CommentEntity) => comment.track)
  // типиз.данн. (возвращ.масс. comments)
  comments: CommentEntity[];
}
