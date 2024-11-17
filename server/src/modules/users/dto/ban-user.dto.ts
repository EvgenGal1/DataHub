import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    example: 1,
    description: 'ID Пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'ID Пользователя не должно быть пустым' })
  @IsNumber({}, { message: 'ID Пользователя должно быть числом' })
  readonly userId: number;

  @ApiProperty({
    example: 'Нарушение правил',
    description: 'Причина Бана',
    required: true,
  })
  @IsNotEmpty({ message: 'Причина Бана не должна быть пустой' })
  @IsString({ message: 'Причина Бана должна быть строкой' })
  readonly banReason: string;
}
