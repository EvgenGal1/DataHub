import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserEntity } from 'src/users/entities/user.entity';
import { TrackEntity } from 'src/track/entities/track.entity';

@Entity('reactions')
export class ReactionEntity {
  // id, текст коммент, id.user, id.track
  @PrimaryColumn()
  id: number;

  @Column({ default: 'коммент #' })
  text: string;

  // связь табл. Мн.к 1му. У Мн.комм. Один польз.
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.reactions)
  user: UserEntity;

  // связь табл. Мн.к 1му. У Мн.комм. Один трек
  @ManyToOne(() => TrackEntity, (track: TrackEntity) => track.reactions)
  track: TrackEntity;

  // ^^ прописать совместную таблицу под лайки, комменты, реакции. Подтягивать только то что нужно к запросу.
  // Например на один трек от 3х user может быть по 3 лайка, коммента, репоста и это займёт только 3 строчки в данн.табл.
  // При подтяг.данн. раскидывать res по местам
}
