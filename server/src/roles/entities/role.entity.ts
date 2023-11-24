/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Column,
  ColumnType,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from 'src/users/entities/user.entity';
import { UserRolesEntity } from './user-roles.entity';

interface RoleCreationAttrs {
  value: string;
  description: string;
}

@Entity({ name: 'roles' /* , createdAt: false, updatedAt: false */ })
export class RoleEntity /* extends Model<Role, RoleCreationAttrs> */ {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryColumn({
    // @PrimaryGeneratedColumn({
    type: 'integer',
    // unique: true,
  })
  id: number;

  @ApiProperty({ example: 'USER', description: 'Уникальное Значение роли ' })
  @Column({
    // type: 'text',
    nullable: true, //false,
    // unique: true,
  })
  role: string;

  @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
  @Column({
    type: 'text',
    // nullable: true, // Разрешить NULL
  })
  description: string;

  // связь табл. Мн.ко Мн. У Мн.Ролей.Мн.Польз.
  // ~~ связка ч/з отд.доп.табл.UserRolesEntity
  // @ManyToMany(() => UserEntity, () => UserRolesEntity) // ? как корректнее UsRolEnt или (user) => user.roles)
  // @JoinTable({ name: 'user_roles' })
  // users: UserEntity[];
  // ~~ связка ч/з доп.табл.UserRolesEntity + доп.св-ва
  @OneToMany(() => UserRolesEntity, (userRolesEntity) => userRolesEntity.roleId)
  // @JoinTable({ name: 'user_roles' })
  userRolesEntityRol: UserRolesEntity[];
}
