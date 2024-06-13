import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    default: 'USER',
    description: 'Роль',
  })
  value: string;

  @ApiProperty({
    default: 'Описание Роли',
    description: 'Описание Роли',
  })
  description: string;
}
