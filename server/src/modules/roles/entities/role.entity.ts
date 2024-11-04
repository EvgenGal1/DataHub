import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'roles', schema: 'public' })
export class RoleEntity {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryColumn({ type: 'integer', unique: true })
  id: number;

  // Роль
  @ApiProperty({ example: 'visitor', description: 'visitor' })
  @Column({
    type: 'varchar',
    default: 'visitor',
    unique: true,
    nullable: false,
  })
  value: string;

  // Описание Роли
  @ApiProperty({
    example: 'Администратор',
    default: 'Описание роли',
    description: 'Описание роли',
  })
  @Column({ type: 'text', default: 'Описание роли', nullable: false })
  description: string;

  // ^^ связки Мн.>Мн. у users/userId и roles/roleId
  @ManyToMany(() => UserEntity, (user) => user.roles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  users?: UserEntity[];

  @CreateDateColumn()
  startDate?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
