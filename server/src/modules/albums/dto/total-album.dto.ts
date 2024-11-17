import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';

export class TotalAlbumDto {
  @ApiProperty({
    example: '0:00',
    description: 'Длительность Треков в Альбоме в ЧЧ:ММ',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Длительность Треков в Альбоме должна быть строкой' })
  readonly total_duration?: string;

  @ApiProperty({
    example: 10,
    description: 'Количество Треков в Альбоме',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Количество Треков в Альбоме должно быть числом' })
  readonly total_tracks?: number;

  @ApiProperty({
    example: 'Rock | Metal',
    description: 'Жанры Альбома',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Жанры Альбома должны быть строкой' })
  readonly genres?: string;

  @ApiProperty({
    example: '2022-02-22 00:11:23',
    description: 'Дата удаления Альбома',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Дата удаления Альбома должна быть датой' })
  readonly deletedAt?: Date;
}
