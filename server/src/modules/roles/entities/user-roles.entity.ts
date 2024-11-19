import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user_roles', schema: 'public' })
export class UserRolesEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ default: 1, nullable: true })
  @ApiProperty({
    example: 1,
    description:
      'Уровень Роли (например, Роль Miloman ур.1 при загрузке 1 изо, ур.2 > 5 изо и т.д.)',
  })
  public level: number | null;

  @PrimaryColumn({ name: 'userId' })
  public userId: number;

  @PrimaryColumn({ name: 'roleId' })
  public roleId: number;

  // ^ нужн.по док.
  // @ManyToOne(() => UserEntity, (user) => user./* roles */ userRoles, {
  //   onDelete: 'NO ACTION',
  //   onUpdate: 'NO ACTION',
  // })
  // // @JoinColumn({ name: 'userId' })
  // public user: UserEntity;
  // ^ нужн.по док.
  // @ManyToOne(() => RoleEntity, (role) => role.userRoles, {
  //   onDelete: 'NO ACTION',
  //   onUpdate: 'NO ACTION',
  // })
  // // @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
  // public role: RoleEntity;
  //
  // ^ раб, но запись странная
  // @ManyToOne(() => UserEntity, (user) => user.userRoles /* , { eager: true } */ )
  // @JoinColumn({ name: 'userId' })
  // user: UserEntity;
  // ^ раб, но запись странная
  // @ManyToOne/* ManyToMany */(() => RoleEntity, (role) => role.userRoles /* , { eager: true } */ )
  // @JoinColumn({ name: 'roleId' })
  // role: RoleEntity;
}
