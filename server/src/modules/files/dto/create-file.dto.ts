import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  Length,
} from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    example: 'my-file.jpg',
    description: 'Название Файла',
    required: true,
  })
  @IsNotEmpty({ message: 'Название Файла не должно быть пустым' })
  @IsString({ message: 'Название Файла должно быть строкой' })
  @Length(1, 255, {
    message: 'Название Файла должно быть от 1 до 255 символов',
  })
  readonly fileName: string;

  @ApiProperty({
    example: 1024,
    description: 'Размер Файла в байтах',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Размер Файла должен быть числом' })
  readonly size?: number;

  @ApiProperty({
    example: '/images/my-file.jpg',
    description: 'Путь к Файлу',
    required: true,
  })
  @IsNotEmpty({ message: 'Путь к Файлу не должен быть пустым' })
  @IsString({ message: 'Путь к Файлу должен быть строкой' })
  @Length(1, 500, { message: 'Путь к Файлу должен быть от 1 до 500 символов' })
  readonly path: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'Тип Файла (например, image/jpeg, audio/mp3 и т.д.)',
    required: true,
  })
  @IsNotEmpty({ message: 'Тип Файла не должен быть пустым' })
  @IsString({ message: 'Тип Файла должен быть строкой' })
  @Length(1, 50, { message: 'Тип Файла должен быть от 1 до 50 символов' })
  readonly mimeType: string;
}
