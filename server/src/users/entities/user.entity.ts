// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.User)
// декораторы для раб.с БД
import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TrackEntity } from '../../track/entities/track.entity';
import { CommentEntity } from 'src/track/entities/comment.entity';

// декоратор для соед.с БД
@Entity('users')
export class UserEntity {
  // декоратор для авто.генер.id, eml, psw, имя пользователя, роль доступов, подтвржд.почты, ссылк.активации
  @PrimaryGeneratedColumn()
  id: number;

  // созд.простых колонок
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  fullname: string;

  @Column({ default: 'USER' })
  role: string;

  // подтвержд.актив.ч/з почту по ссылке // ? упразд.до одного link - есть ссылка(подтвердил), нет(не подтврдил)
  @Column({ default: false })
  activated: boolean;

  // ссылка активации ч/з почту
  @Column({ default: '---' })
  link: string;

  // связь табл. 1го ко Мн. У польз.Мн.треков. 1ый аргум.аноним.fn (табл.обращения - TrackEntity), 2ый парам.получ.данн.и обратн.связь
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.user)
  //  возвращ.масс.треков
  tracks: TrackEntity[];

  // связь табл. Мн.ко Мн. У польз.Мн.комм.ко Мн.трекам
  @ManyToMany(() => CommentEntity)
  //  возвращ.масс.комментов
  comments: CommentEntity[];
}
