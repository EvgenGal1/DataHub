// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.Auth)

// декораторы для раб.с БД
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// декоратор для соед.с БД
@Entity({ name: 'auth', schema: 'public' })
export class AuthEntity {
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({
    example: '123',
    description: 'Уникальный ID Аутентификации',
  })
  id: number;

  @Column()
  userId: number;

  // psw (скрыт, тип, имя, длина, с обязат.указ. users.password)
  @Column({
    select: false,
    type: 'varchar',
    name: 'password',
    length: 128,
    nullable: true,
  })
  @ApiProperty({
    example: '123-Test',
    description: 'Пароль Пользователя',
    writeOnly: true,
  })
  password: string;

  // refresh Токен (долгий)
  @Column({ nullable: true })
  refreshToken: string;

  // `ссылка активации` ч/з почту
  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации акка ч/з Почту',
  })
  activationLink: string;

  // `активирован` акка User ч/з почту
  @Column({ type: 'boolean', nullable: true })
  @ApiProperty({
    example: false,
    description: 'Акка активирован ч/з Почту',
  })
  activated: false;

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
}
