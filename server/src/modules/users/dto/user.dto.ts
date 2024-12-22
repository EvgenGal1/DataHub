import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UserDto {
  @ApiProperty({
    example: 1,
    description: 'Уникальный ID Пользователя',
  })
  readonly id: number;

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
  @IsEmail({}, { message: 'Некорректный Email' })
  readonly email: string;

  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации аккаунта через Почту',
  })
  @IsOptional()
  @IsString({ message: 'Ссылка должна быть строкой' })
  readonly activatedLink?: string;

  @ApiProperty({
    example: 1,
    description: 'ID Аватара Пользователя',
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID должен быть числом' })
  readonly coverArtId?: number;

  @ApiProperty({
    example: [1, 2],
    description: 'ID Ролей Пользователя (может быть один или несколько)',
  })
  @IsOptional()
  readonly roles?: number[] | any;
}
