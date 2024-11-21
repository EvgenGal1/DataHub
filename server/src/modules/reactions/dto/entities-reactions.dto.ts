import { IsOptional, IsInt, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnitiesReactionsDto {
  @ApiProperty({
    example: 1,
    description: 'ID Файла',
    required: false,
  })
  @IsOptional()
  @IsInt()
  fileId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID Трека',
    required: false,
  })
  @IsOptional()
  @IsInt()
  trackId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID Альбома',
    required: false,
  })
  @IsOptional()
  @IsInt()
  albumId?: number;
}
