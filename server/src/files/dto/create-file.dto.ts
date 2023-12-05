import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ default: 'Название файла' })
  readonly originalname: string;

  @ApiProperty({ default: 'Назначение/Папка' })
  readonly target: string;
}
