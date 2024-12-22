// ^ `Сущность`.взаимод.с БД (стркт.табл./измен.данн.в табл.Auth)

// декораторы для раб.с БД
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../users/entities/user.entity';

// декоратор для соед.с БД
@Entity({ name: 'auth', schema: 'public' })
export class AuthEntity {
  @PrimaryColumn({ type: 'integer', unique: true })
  @ApiProperty({
    example: '123',
    description: 'Уникальный ID Аутентификации',
  })
  id: number;

  // связь 1 к 1. У Одного Трека Один Файл
  @OneToOne(() => UserEntity, (user: UserEntity) => user.authId)
  @JoinColumn({ name: 'userId' }) // Указываем имя столбца для связи
  @ApiProperty({
    type: () => UserEntity,
    description: 'ID Пользователя',
  })
  userId: UserEntity | number;

  // psw (тип, имя, длина, с обязат.указ. users.password)
  @Column({
    type: 'varchar',
    name: 'password',
    length: 128,
    nullable: false,
  })
  @ApiProperty({
    example: '123-Test',
    description: 'Пароль Пользователя',
    writeOnly: true,
  })
  password: string;

  // refresh Токен (долгий)
  @Column({ nullable: false })
  @ApiProperty({
    example: 'Jqdfvg.rWeth6k-feT3b',
    description: 'Refresh Токен',
  })
  refreshToken: string;

  // ? REF_T_EXPIRES

  // `ссылка активации` ч/з почту
  @Column({ type: 'varchar', unique: true, nullable: false })
  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации акка ч/з Почту',
  })
  activationLink: string;

  // `активирован` акка User ч/з почту
  @Column({ type: 'boolean', nullable: false })
  @ApiProperty({
    example: false,
    description: 'Акка активирован ч/з Почту',
  })
  activated: false;

  // корзина врем.false
  @Column({ nullable: true })
  basketId: number;

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
