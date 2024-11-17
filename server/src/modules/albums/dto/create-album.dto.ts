import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Length,
} from 'class-validator';

export class CreateAlbumDto {
  @ApiProperty({
    example: 'Мой Альбом',
    description: 'Название Альбома',
    required: true,
  })
  @IsNotEmpty({ message: 'Название Альбома не должно быть пустым' })
  @IsString({ message: 'Название Альбома должно быть строкой' })
  @Length(1, 100, {
    message: 'Название Альбома должно быть от 1 до 100 символов',
  })
  readonly title: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Авторы Альбома',
    required: true,
  })
  @IsNotEmpty({ message: 'Авторы Альбома не должны быть пустыми' })
  @IsString({ message: 'Авторы Альбома должны быть строкой' })
  @Length(1, 255, {
    message: 'Авторы Альбома должны быть от 1 до 255 символов',
  })
  readonly author: string;

  @ApiProperty({
    example: 'Rock | Metal',
    description: 'Жанры Альбома',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Жанры Альбома должны быть строкой' })
  @Length(1, 255, { message: 'Жанры Альбома должны быть от 1 до 255 символов' })
  readonly genres?: string;

  @ApiProperty({
    example: 2000,
    description: 'Год выпуска Альбома',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Год выпуска Альбома должен быть числом' })
  readonly year?: number;

  @ApiProperty({
    example: 'Описание Альбома',
    description: 'Описание Альбома',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Описание Альбома должно быть строкой' })
  readonly description?: string;

  @ApiProperty({
    example: 10,
    description: 'Количество Треков в Альбоме',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Количество Треков в Альбоме должно быть числом' })
  readonly total_tracks?: number;

  @ApiProperty({
    example: '00:30:00',
    description: 'Длительность Треков в Альбоме',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Длительность Треков в Альбоме должна быть строкой' })
  readonly total_duration?: string;
}
