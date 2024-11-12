// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.User)
// декораторы для раб.с БД
import {
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
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
  // @PrimaryGeneratedColumn('uuid') // коммит чтоб указ.свободный id ч/з fn getSmallestIDAvailable
  @PrimaryColumn({ type: 'integer', unique: true })
  // декоратор для авто.генер.id. поля: id, eml, psw, имя пользователя, подтвржд./ссылк актив.ч/з почту, аватар
  @ApiProperty({
    example: '123',
    description: 'Уникальный идентификатор Пользователя',
  })
  id: number;

  @Column({ type: 'varchar', name: 'fullName', length: 50, nullable: false })
  @ApiProperty({
    example: 'Тест Тестович',
    description: 'Полное Имя Пользователя',
  })
  fullName: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
    name: 'email',
    length: 128,
  })
  @ApiProperty({
    example: 'Test@Test.ru',
    description: 'Электронная почта Пользователя',
  })
  email: string;

  // psw (скрыт, тип, имя, длина, с обязат.указ. users.password)
  @Column({
    select: false,
    type: 'varchar',
    name: 'password',
    length: 128,
    nullable: false,
  })
  @ApiProperty({
    example: '123-Test',
    description: 'Пароль Пользователя',
    writeOnly: true,
  })
  password: string;

  // подтвержд./ссылка актив.ч/з почту по ссылке (с опцион.указ. users.activatedLink)
  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации акка ч/з Почту',
  })
  activatedLink: string;

  // связь Мн.ко Мн. м/у Пользователями и Файлами Аватара ч/з доп.табл.user_avatar
  @ManyToMany(() => FileEntity, (file: FileEntity) => file.avatars)
  @JoinTable({
    name: 'user_avatar',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fileId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => FileEntity,
    isArray: true,
    description: 'Аватары Пользователя',
  })
  avatars: FileEntity[];

  // связь Мн.ко Мн. у users/userId и roles/roleId ч/з доп.табл.user_roles
  @ManyToMany(() => RoleEntity, (role) => role.users, {
    // Ничего не делать при обновлении/удалении Ролей
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  @ApiProperty({
    type: () => RoleEntity,
    isArray: true,
    description: 'Роли Пользователя',
  })
  roles?: RoleEntity[];

  // У Польз.Мн.загр.Файлов. Связь 1го ко Мн. Аноним.fn(табл.обращ.(TrackEntity), получ.данн.по обрат.связи(track.uploadedBy))
  @OneToMany(() => FileEntity, (file: FileEntity) => file.uploadedBy)
  @ApiProperty({
    type: () => FileEntity,
    isArray: true,
    description: 'Файлы, загруженные Пользователем',
  })
  uploadedFiles: FileEntity[];

  // У Польз.Мн.Треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.uploadedBy)
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    description: 'Треки, загруженные Пользователем',
  })
  uploadedTracks: TrackEntity[];

  // У Польз.Мн.Альбомов
  @OneToMany(() => AlbumEntity, (album: AlbumEntity) => album.uploadedBy)
  @ApiProperty({
    type: () => AlbumEntity,
    isArray: true,
    description: 'Альбомы, загруженные Пользователем',
  })
  uploadedAlbums: AlbumEntity[];

  // У Польз.Мн.Реакций
  @OneToMany(() => ReactionEntity, (reaction: ReactionEntity) => reaction.user)
  @ApiProperty({
    type: () => ReactionEntity,
    isArray: true,
    description: 'Реакции, оставленные Пользователем',
  })
  reactions: ReactionEntity[];

  @CreateDateColumn({ name: 'createdAt' })
  startDate?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
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
