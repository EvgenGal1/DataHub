import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserEntity } from 'src/users/entities/user.entity';
import { TrackEntity } from 'src/tracks/entities/track.entity';

@Entity('reactions')
export class ReactionEntity {
  // id, текст реакции, id.user, id.track
  @PrimaryColumn()
  id: number;

  @Column({ default: 'реакция #' })
  text: string;

  // связь табл. Мн.к 1му. У Мн.реакц. Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.reactions)
  user: UserEntity;

  // связь табл. Мн.к 1му. У Мн.реакц. Один трек
  @ManyToOne(() => TrackEntity, (track: TrackEntity) => track.reactions)
  track: TrackEntity;

  // ^^ прописать совместную таблицу под лайки, комменты, реакции. Подтягивать только то что нужно к запросу.
  // Например на один трек от 3х user может быть по 3 лайка, коммента, репоста и это займёт только 3 строчки в данн.табл.
  // При подтяг.данн. раскидывать res по местам
}
