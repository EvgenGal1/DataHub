import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
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
