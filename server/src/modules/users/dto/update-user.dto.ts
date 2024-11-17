import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  Length,
  IsIn,
} from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'Тест Тестович',
    description: 'Полное Имя Пользователя',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Полное Имя должно быть строкой' })
  @Length(2, 50, { message: 'Полное Имя должно быть от 2 до 50 символов' })
  readonly fullName?: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'Email Пользователя',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Email должен быть строкой' })
  @IsEmail({}, { message: 'Некорректный Email' })
  readonly email?: string;

  @ApiProperty({
    example: '123_Test',
    description: 'Пароль Пользователя',
    required: false,
    minLength: 4,
    maxLength: 128,
  })
  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(4, 128, { message: 'Пароль должен быть от 4 до 128 символов' })
  readonly password?: string;

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
  @IsIn([Number, Array], { message: 'Должно быть числом или массивом чисел' })
  readonly roles?: number[] | number;
}
