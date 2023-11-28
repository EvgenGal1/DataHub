import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from 'src/users/entities/user.entity';

@Entity({ name: 'roles' })
export class RoleEntity {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  // @PrimaryColumn({type: 'integer',unique: true,})
  id: number;

  // Роль
  @Column({ type: 'varchar', unique: true, nullable: false })
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
}
