/* eslint-disable @typescript-eslint/no-unused-vars */
// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.User)
// декораторы для раб.с БД
import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { RoleEntity } from 'src/roles/entities/role.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { TrackEntity } from '../../track/entities/track.entity';
import { CommentEntity } from 'src/track/entities/comment.entity';
import { AlbumEntity } from 'src/album/entities/album.entity';
import { UserRolesEntity } from 'src/roles/entities/user-roles.entity';

// ~~ настр.под колонки из доков > https://orkhan.gitbook.io/typeorm/docs/entities
export enum UserRole { // TS`перечисление`
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
  GHOST = 'ghost',
}
export type UserRoleType = 'admin' | 'user' | 'editor' | 'ghost'; // Arr`перечисление`

// декоратор для соед.с БД
@Entity('users')
export class UserEntity {
  // декоратор для авто.генер.id, eml, psw, имя пользователя, роль доступов, подтвржд.почты, ссылк.активации
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryColumn({ type: 'integer', unique: true })
  id: number;

  @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
  @Column({
    type: 'text',
    unique: true,
    nullable: false,
  })
  email: string;

  @ApiProperty({ example: '12345678', description: 'Пароль' })
  @Column({
    type: 'text',
    nullable: false,
  })
  password: string;

  @ApiProperty({ example: 'Тест', description: 'Полное Имя' })
  @Column({
    // type: 'text',
    // default: `${email}``${id}`, // применить настр.имени по умолч.
  })
  fullname: string;

  // подтвержд.актив.ч/з почту по ссылке
  // ? упразд.до одного link - есть ссылка(подтвердил), нет(не подтврдил)
  // @Column({ default: false })
  // activated: boolean;
  // ссылка активации ч/з почту
  // @Column({ default: '---' })
  // link: string;
  // ссылка активации ч/з почту
  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации акка ч/з Почту',
  })
  @Column({
    type: 'text',
    default: '',
  })
  activatedLink: string;

  // связь табл. Мн.ко Мн ч/з доп.табл.UserRolesEntity. У Мн.Польз.Мн.Ролей.
  // ~~ настр.под колонки из доков
  // @Column({
  // type: 'enum', // TS`перечисление`
  // enum: UserRole,
  // default: UserRole.GHOST, // [UserRole.GHOST, UserRole.EDITOR],
  // type: 'enum', // Arr`перечисление`
  // enum: ['user', 'admin', 'editor', 'ghost'], // `редактор` `призрак`
  // default: 'ghost', // ['ghost', 'editor'],
  // })
  // role /* s */ : UserRole[]; // TS`перечисление`
  // role /* s */ : UserRoleType[]; // Arr`перечисление`
  // связка ч/з доп.табл.UserRolesEntity
  @ManyToMany(() => RoleEntity, () => UserRolesEntity) // ? как корректнее UsRolEnt или (role) => role.users
  @JoinTable({ name: 'user_roles' })
  roles: RoleEntity[];

  // ~~ доп.настр.подтягивания Роли в users. Скорее только для @Column ----------------------------------------------------------------------------------
  // @BeforeInsert()
  // @BeforeUpdate()
  // updateRoles() {
  //   if (!this.roles) {
  //     this.roles = [];
  //   }
  //   if (this.fullname && !this.roles.find((r) => r.role === 'user')) {
  //     const userRole = new RoleEntity();
  //     userRole.role = 'user';
  //     userRole.description = 'Regular user';
  //     this.roles.push(userRole);
  //   }
  //   if (this.activatedLink) {
  //     this.roles = this.roles.filter((r) => r.role !== 'ghost');
  //   }
  //   if (
  //     this.fullname &&
  //     this.roles.find((r) => r.role === 'user') &&
  //     !this.roles.find((r) => r.role === 'moder')
  //   ) {
  //     const moderRole = new RoleEntity();
  //     moderRole.role = 'moder';
  //     moderRole.description = 'Moderator';
  //     this.roles.push(moderRole);
  //   }
  // }
  // ----------------------------------------------------------------------------------
  // get hasGhostRole(): boolean {
  //   return !this.fullname;
  // }
  // get hasActiveEmail(): boolean | string {
  //   return this.activatedLink;
  // }
  // get hasUserAndModerRoles(): boolean {
  //   return (
  //     this.fullname &&
  //     this.roles.some((role) => role.role === 'user') &&
  //     this.roles.some((role) => role.role === 'moder')
  //   );
  // }
  // ----------------------------------------------------------------------------------

  // связь табл. 1го ко Мн. У польз.Мн.треков. 1ый аргум.аноним.fn (табл.обращения - TrackEntity), 2ый парам.получ.данн.и обратн.связь
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.user)
  //  возвращ.масс.треков
  tracks: TrackEntity[];

  // связь табл. 1го ко Мн. У польз.Мн.альбомов
  @OneToMany(() => AlbumEntity, (album: AlbumEntity) => album.user)
  // возвращ.масс.альбомов
  albums: AlbumEntity[];

  // связь табл. 1го ко Мн. У польз.Мн.файлов
  @OneToMany(() => FileEntity, (file: FileEntity) => file.user)
  // возвращ.масс.файлов
  files: FileEntity[];

  // связь табл. Мн.ко Мн. У польз.Мн.комм.ко Мн.трекам
  // @ManyToMany(() => CommentEntity)
  @OneToMany(() => CommentEntity, (file: CommentEntity) => file.text)
  //  возвращ.масс.комментов
  comments: CommentEntity[];

  // ^ доп.табл.>будущее
  // @ApiProperty({ example: 'true', description: 'Забанен или нет' })
  // @Column({ type: 'boolean', defaultValue: false })
  // banned: boolean;
  // @ApiProperty({ example: 'За хулиганство', description: 'Причина блокировки' })
  // @Column({ type: 'text', nullable: true })
  // banReason: string;
  // @HasMany(() => Post)
  //   posts: Post[];
}
