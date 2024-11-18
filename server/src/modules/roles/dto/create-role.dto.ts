import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'GUEST',
    description: 'Роль',
    required: true,
  })
  @IsNotEmpty({ message: 'Роль не должна быть пустой' })
  @IsString({ message: 'Роль должна быть строкой' })
  @Length(1, 50, { message: 'Роль должна быть от 1 до 50 символов' })
  readonly value: string;

  @ApiProperty({
    example: 'Обычный Пользователь',
    description: 'Описание Роли',
    required: true,
  })
  @IsNotEmpty({ message: 'Описание Роли не должно быть пустым' })
  @IsString({ message: 'Описание Роли должно быть строкой' })
  @Length(1, 255, { message: 'Описание Роли должно быть от 1 до 255 символов' })
  readonly description: string;
}
