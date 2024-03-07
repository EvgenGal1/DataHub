import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { RoleEntity } from './role.entity';

@Entity({ name: 'user_roles', schema: 'public' })
export class UserRolesEntity {
  @PrimaryGeneratedColumn()
  // @PrimaryColumn({type: 'integer',unique: true,})
  id: number;

  // уровень Роли (напр.: роль Miloman ур.1 при загр.1 изо, ур.2 > 5 изо и т.д.)
  @Column({ default: 1, nullable: true })
  level: number;

  // ^^ связки Мн.>Мн. у users/userId и roles/roleId
  @PrimaryColumn({ name: 'userId' })
  userId: number;

  @PrimaryColumn({ name: 'roleId' })
  roleId: number;

  @ManyToOne(() => UserEntity, (user) => user.roles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  users: UserEntity[];

  @ManyToOne(() => RoleEntity, (role) => role.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
  roles: RoleEntity[];

  // ~~ доп.столб.в users.roles
  // Теперь, при создании или обновлении связей UserRolesEntity, столбец roles в сущности UserEntity будет автоматически заполнен массивом ролей.
  // @BeforeInsert()
  // @BeforeUpdate()
  // updateRolesArray() {
  //   this.user.roles = this.user.userRoles.map((userRole) => userRole.role.role);
  // }
}
