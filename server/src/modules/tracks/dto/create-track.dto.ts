import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  Length,
  IsIn,
} from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({
    example: 'Моя песня',
    description: 'Название Трека',
    required: true,
  })
  @IsNotEmpty({ message: 'Название Трека не должно быть пустым' })
  @IsString({ message: 'Название Трека должно быть строкой' })
  @Length(1, 100, {
    message: 'Название Трека должно быть от 1 до 100 символов',
  })
  readonly title: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Автор Трека',
    required: true,
  })
  @IsNotEmpty({ message: 'Автор Трека не должен быть пустым' })
  @IsString({ message: 'Автор Трека должен быть строкой' })
  @Length(1, 100, { message: 'Автор Трека должен быть от 1 до 100 символов' })
  readonly author: string;

  @ApiProperty({
    example: 'Rock',
    description: 'Жанр Трека',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Жанр Трека должен быть строкой' })
  @Length(1, 50, { message: 'Жанр Трека должен быть от 1 до 50 символов' })
  readonly genre?: string;

  @ApiProperty({
    example: 'Это моя песня...',
    description: 'Текст Трека',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Текст Трека должен быть строкой' })
  readonly lyrics?: string;

  @ApiProperty({
    example: 0,
    description: 'Количество прослушиваний Трека',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Количество прослушиваний должно быть числом' })
  readonly listens?: number;

  @ApiProperty({
    example: 180,
    description: 'Продолжительность Трека в секундах',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Продолжительность Трека должна быть числом' })
  readonly duration?: number;

  @ApiProperty({
    example: 1,
    description: 'ID Пользователя, загрузившего Трек',
    required: true,
  })
  @IsNotEmpty({ message: 'ID Пользователя не должен быть пустым' })
  @IsNumber({}, { message: 'ID Пользователя должен быть числом' })
  readonly userId: number;

  @ApiProperty({
    example: 1,
    description: 'ID Файла Трека',
    required: true,
  })
  @IsNotEmpty({ message: 'ID Файла не должен быть пустым' })
  @IsNumber({}, { message: 'ID Файла должен быть числом' })
  readonly fileId: number;

  @ApiProperty({
    example: 1,
    description: 'ID Обложки Трека',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID Обложки должен быть числом' })
  readonly coverArtId?: number;

  @ApiProperty({
    example: [1, 2],
    description:
      'ID Альбомов, в которых содержится Трек (может быть один или несколько)',
    required: false,
  })
  @IsOptional()
  @IsIn([Number, Array], {
    each: true,
    message: 'ID Альбомов должны быть числом или массивом чисел',
  })
  readonly albumIds?: number[] | number;
}
