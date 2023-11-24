/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Column,
  ColumnType,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from 'src/users/entities/user.entity';
import { AlbumEntity } from 'src/album/entities/album.entity';
import { TrackEntity } from 'src/track/entities/track.entity';
import { UserRolesEntity } from './user-roles.entity';

interface RoleCreationAttrs {
  value: string;
  description: string;
}

@Entity({ name: 'roles' /* , createdAt: false, updatedAt: false */ })
export class RoleEntity /* extends Model<Role, RoleCreationAttrs> */ {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryColumn({
    type: 'integer',
    unique: true,
  })
  id: number;

  @ApiProperty({ example: 'USER', description: 'Уникальное Значение роли ' })
  @Column({
    type: 'text',
    nullable: false,
    unique: true,
  })
  role: string;

  @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
  @Column({
    type: 'text',
    nullable: true, // Разрешить NULL
  })
  description: string;

  // связка ч/з отд.доп.табл.UserRolesEntity
  @ManyToMany(() => UserEntity, () => UserRolesEntity) // ? как корректнее UsRolEnt или (user) => user.roles)
  users: UserEntity[];
}
