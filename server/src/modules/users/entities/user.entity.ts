// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.User)

// декораторы для раб.с БД
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// подкл.Сущности
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

  @Column({
    type: 'varchar',
    name: 'fullName',
    length: 50,
    unique: true,
    nullable: false,
  })
  @ApiProperty({
    example: 'Тест Тестович',
    description: 'Полное Имя Пользователя',
  })
  fullName: string;

  @Column({
    type: 'varchar',
    name: 'email',
    length: 128,
    unique: true,
    nullable: false,
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

  // Подтвержд./ссылка актив.ч/з почту по ссылке (с опцион.указ. users.activatedLink)
  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации акка ч/з Почту',
  })
  activatedLink: string;

  // у Мн.Пользователей Один Аватар (заглушка). Общ.связь coverArt в user,track,album > - лишн.столбца в file
  @ManyToOne(() => FileEntity, (file: FileEntity) => file.userAvatar)
  @ApiProperty({
    type: () => FileEntity,
    description: 'Аватар Пользователей',
  })
  coverArt: FileEntity | null;

  // связь Мн.ко Мн. У users/userId и roles/roleId ч/з доп.табл.user_roles
  @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.users, {
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

  // у Польз.Мн.загр.Файлов. Связь 1го ко Мн. Аноним.fn(табл.обращ.(TrackEntity), получ.данн.по обрат.связи(track.user))
  @OneToMany(() => FileEntity, (file: FileEntity) => file.user)
  @ApiProperty({
    type: () => FileEntity,
    isArray: true,
    description: 'Файлы, загруженные Пользователем',
  })
  files: FileEntity[];

  // у Польз.Мн.Треков
  @OneToMany(() => TrackEntity, (track: TrackEntity) => track.user)
  @ApiProperty({
    type: () => TrackEntity,
    isArray: true,
    description: 'Треки, загруженные Пользователем',
  })
  tracks: TrackEntity[];

  // у Польз.Мн.Альбомов
  @OneToMany(() => AlbumEntity, (album: AlbumEntity) => album.user)
  @ApiProperty({
    type: () => AlbumEntity,
    isArray: true,
    description: 'Альбомы, загруженные Пользователем',
  })
  albums: AlbumEntity[];

  // у Польз.Мн.Реакций
  @OneToMany(() => ReactionEntity, (reaction: ReactionEntity) => reaction.user)
  @ApiProperty({
    type: () => ReactionEntity,
    isArray: true,
    description: 'Реакции, оставленные Пользователем',
  })
  reactions: ReactionEntity[];

  // декор.созд.
  @CreateDateColumn({ name: 'createdAt' })
  createdAt?: Date;

  // декор.поментки удаления (без удаления)
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
