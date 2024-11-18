import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'roles', schema: 'public' })
export class RoleEntity {
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  id: number;

  // Роль
  @Column({ unique: true, nullable: false })
  @ApiProperty({ example: 'GUEST', description: 'Роль' })
  value: string;

  // Описание Роли
  @Column({ unique: true, nullable: false })
  @ApiProperty({
    example: 'GUEST',
    description: 'Описание Роли',
  })
  description: string;

  // у Пользователя Мн.Ролей <> у Роли Мн.Пользователей
  @ManyToMany(() => UserEntity, (user: UserEntity) => user.roles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  // ! ошб.  -  ограничение "PK_..." в таблице "user_roles" не существует
  // @JoinTable({
  //   name: 'user_roles',
  //   joinColumn: { name: 'roleId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  // })
  @ApiProperty({
    type: () => UserEntity,
    isArray: true,
    description: 'Роли Пользователя',
  })
  users: UserEntity[];
  // ^ нужн.по док.
  // @OneToMany(() => UserRolesEntity, (userRoles) => userRoles.role)
  // public userRoles: UserRolesEntity[];
  //
  // ^ раб, но запись странная
  // @OneToMany(() => UserRolesEntity, (userRoles) => userRoles.role)
  // userRoles: UserRolesEntity[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
