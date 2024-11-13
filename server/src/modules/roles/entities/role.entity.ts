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
  // ! JoinTable откл от ошб. ERROR [TypeOrmModule] Unable to connect to the database (localhost). Retrying  >>  QueryFailedError: ограничение "PK_54ee852c4fe81342f9c06ee0fdd" в таблице "user_roles" не существует
  @ApiProperty({
    type: () => UserEntity,
    isArray: true,
    description: 'Роли Пользователя',
  })
  users?: UserEntity[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt?: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;
}
