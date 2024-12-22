import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    example: 1,
    description: 'User ID',
    required: true,
  })
  @IsNotEmpty({ message: 'User ID не должен быть пустым' })
  @IsNumber({}, { message: 'User ID должен быть числом' })
  userId: number;

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
  password: string;

  @ApiProperty({
    example: 'random_refresh_token',
    description: 'Токен Обновления',
    required: false,
  })
  refreshToken: string;

  @ApiProperty({
    example: 'http://example.com/activate',
    description: 'Ссылка активации',
    required: false,
  })
  activationLink: string;

  @ApiProperty({
    default: false,
    description: 'Активированный статус',
    required: false,
  })
  activated?: boolean = false;

  @ApiProperty({
    example: 1,
    description: 'Basket ID',
    required: false,
  })
  @IsNumber({}, { message: 'Basket ID должен быть числом' })
  basketId: number;
}
