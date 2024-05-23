// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.User)
// декораторы для раб.с БД
import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { RoleEntity } from '../../roles/entities/role.entity';
import { FileEntity } from '../../files/entities/file.entity';
import { TrackEntity } from '../../tracks/entities/track.entity';
import { AlbumEntity } from '../../albums/entities/album.entity';
import { ReactionEntity } from '../../reactions/entities/reaction.entity';

// декоратор для соед.с БД
@Entity({ name: 'users', schema: 'public' })
export class UserEntity {
  // декоратор для авто.генер.id. поля: id, eml, psw, имя пользователя, подтвржд./ссылк актив.ч/з почту, аватар
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  // @PrimaryGeneratedColumn()
  @PrimaryColumn({ type: 'integer', unique: true })
  id: number;

  @ApiProperty({ example: 'Test@Test.ru', description: 'Почтовый адрес' })
  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
    name: 'email',
    length: 128,
  })
  email: string;

  @ApiProperty({ example: '123_Test', description: 'Пароль' })
  @Column({ type: 'varchar', nullable: false, name: 'password', length: 128 })
  password: string;

  @ApiProperty({ example: 'Тест Тестович', description: 'Полное Имя' })
  @Column({ type: 'varchar', name: 'fullname', length: 50 })
  fullname: string;

  // подтвержд./ссылка актив.ч/з почту по ссылке
  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации акка ч/з Почту',
  })
  @Column({ type: 'varchar', default: '' })
  activatedLink: string;

  @ApiProperty({
    example: 'avatar',
    description: 'Аватар',
    default: 'avatar',
    nullable: false,
  })
  @Column({
    type: 'varchar',
    name: 'avatar',
    default: 'avatar',
    nullable: false,
  })
  avatar: string;

  // ^^ связки Мн.>Мн. у users/userId и roles/roleId
  @ManyToMany(() => RoleEntity, (role) => role.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles?: RoleEntity[];

  // связь табл. 1го ко Мн. У польз.Мн.треков. 1ый аргум.аноним.fn (табл.обращения - TrackEntity), 2ый парам.получ.данн.и обратн.связь
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.user)
  //  возвращ.масс.треков
  tracks: TrackEntity[];

  // связь табл. 1го ко Мн. У польз.Мн.альбомов
  @OneToMany(() => AlbumEntity, (album: AlbumEntity) => album.user)
  albums: AlbumEntity[];

  // связь табл. 1го ко Мн. У польз.Мн.файлов
  @OneToMany(() => FileEntity, (files: FileEntity) => files.user)
  files: FileEntity[];

  // ? мб. связь табл. Мн.ко Мн. У польз.Мн.реакций.ко Мн.трекам @ManyToMany(() => ReactionEntity)
  // связь табл. 1го ко Мн. У польз.Мн.комм
  @OneToMany(() => ReactionEntity, (files: ReactionEntity) => files.text)
  reactions: ReactionEntity[];

  @CreateDateColumn()
  startDate?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // ^ доп.табл.>будущее
  // @ApiProperty({ example: 'true', description: 'Забанен или нет' })
  // @Column({ type: 'boolean', default: false })
  // banned: boolean;
  // @ApiProperty({ example: 'За хулиганство', description: 'Причина блокировки' })
  // @Column({ type: 'varchar', nullable: true })
  // banReason: string;
  // @OneToMany(() => PostEntity, post => post.user)
  // posts: PostEntity[];
}
