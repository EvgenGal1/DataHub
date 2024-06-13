import { ApiProperty } from '@nestjs/swagger';

export class AddingRolesToUsersDto {
  @ApiProperty({ default: '1,2' })
  userIds: string;

  @ApiProperty({ default: '3' })
  roleIds: string;
}
