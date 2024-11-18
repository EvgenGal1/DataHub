import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddingRolesToUsersDto {
  @ApiProperty({
    example: '1,2,3',
    description: 'IDs Пользователей',
    required: true,
  })
  @IsNotEmpty({
    message: 'IDs Пользователей не должны быть пустыми',
  })
  @IsString({ message: 'IDs Пользователей должны быть строкой' })
  readonly userIds: string;

  @ApiProperty({
    example: '4,5',
    description: 'IDs Ролей',
    required: true,
  })
  @IsNotEmpty({ message: 'IDs Ролей не должны быть пустыми' })
  @IsString({ message: 'IDs Ролей должны быть строкой' })
  readonly roleIds: string;
}
