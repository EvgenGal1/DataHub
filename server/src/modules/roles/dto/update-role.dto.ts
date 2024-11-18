import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    example: 'GUEST',
    description: 'Роль',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Роль должна быть строкой' })
  @Length(1, 50, { message: 'Роль должна быть от 1 до 50 символов' })
  readonly value?: string;

  @ApiProperty({
    example: 'Обычный Пользователь',
    description: 'Описание Роли',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Описание Роли должно быть строкой' })
  @Length(1, 255, { message: 'Описание Роли должно быть от 1 до 255 символов' })
  readonly description?: string;
}
