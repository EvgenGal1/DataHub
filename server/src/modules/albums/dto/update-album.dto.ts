import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Length } from 'class-validator';
import { CreateAlbumDto } from './create-album.dto';

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {
  @ApiProperty({
    example: 'Мой Альбом',
    description: 'Название Альбома',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Название Альбома должно быть строкой' })
  @Length(1, 100, {
    message: 'Название Альбома должно быть от 1 до 100 символов',
  })
  readonly title?: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Автор Альбома',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Автор Альбома должны быть строкой' })
  @Length(1, 255, {
    message: 'Автор Альбома должны быть от 1 до 255 символов',
  })
  readonly author?: string;

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
}
