import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EmlTrueIDDto {
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
    example: 1,
    description: 'Уникальный ID Пользователя',
  })
  @IsNumber({}, { message: 'Basket ID должен быть числом' })
  readonly id?: number;

  @ApiProperty({
    example: 'Y',
    description: 'Флаг сущ.',
  })
  @IsOptional()
  @IsString({ message: 'Флаг должнен быть строкой' })
  readonly flag?: string;
}
