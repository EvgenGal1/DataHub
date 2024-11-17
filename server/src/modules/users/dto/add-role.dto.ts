import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddRoleDto {
  @ApiProperty({
    example: 1,
    description: 'ID Пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'ID Пользователя не должно быть пустым' })
  @IsNumber({}, { message: 'ID Пользователя должно быть числом' })
  readonly userId: number;

  @ApiProperty({
    example: 1,
    description: 'ID Роли',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'ID Роли должно быть числом' })
  readonly roleId?: number;

  @ApiProperty({
    example: 'GUEST',
    description: 'Значение Роли',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Значение Роли должно быть строкой' })
  readonly value?: string;
}
