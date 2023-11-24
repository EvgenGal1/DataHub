/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { RoleEntity } from './role.entity';

@Entity('user_roles')
export class UserRolesEntity {
  @PrimaryColumn({
    // @PrimaryGeneratedColumn({
    type: 'integer',
    unique: true,
  })
  id: number;

  // уровень Роли (напр.: роль Miloman ур.1 при загр.1 изо, ур.2 > 5 изо и т.д.)
  // ~~ дописать > https://orkhan.gitbook.io/typeorm/docs/many-to-many-relations
  // @ApiProperty({ example: 1, description: 'Уровень Роли' })
  @Column({ nullable: true })
  level: number;

  @ManyToOne(() => UserEntity, (user) => user.userRolesEntityUsr /* roles */)
  user /* userId */ : UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.userRolesEntityRol /* role */)
  role /* roleId */ : RoleEntity;

  // ~~ связка ч/з доп.табл.UserRolesEntity + доп.св-ва
  @Column()
  userId: number;

  @Column()
  roleId: number;
}
