// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Тест Тестович',
    description: 'Полное Имя Пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'Полное Имя не должно быть пустым' })
  @IsString({ message: 'Полное Имя должно быть строкой' })
  @Length(2, 50, { message: 'Полное Имя должно быть от 2 до 50 символов' })
  readonly fullName: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'Email Пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  @IsString({ message: 'Email должен быть строкой' })
  @Length(2, 128, { message: 'Email должно быть от 2 до 128 символов' })
  @IsEmail({}, { message: 'Некорректный Email' })
  readonly email: string;

  @ApiProperty({
    example: '123_Test',
    description: 'Пароль Пользователя',
    required: true,
    minLength: 4,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(4, 128, { message: 'Пароль должен быть от 4 до 128 символов' })
  @Matches(
    /^(?=.*[A-Za-zА-Яа-я])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{4,16}$/,
    {
      message: 'Пароль должен содержать букву (EN/RU), цифру, символ',
    },
  )
  readonly password: string;
}
