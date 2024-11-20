import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
  @ApiProperty({
    example: 'Мне очень понравился этот трек!',
    description: 'Текст Реакции',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    example: 5,
    description: 'Оценка Реакции',
    required: false,
  })
  @IsOptional()
  @IsInt()
  rating?: number;

  @ApiProperty({
    example: 1,
    description: 'ID Пользователя',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  // ^ Общ.Реакции. ID/Типы
  // @ApiProperty({ description: 'ID Сущности Реакции', required: true })
  // @IsNotEmpty()
  // @IsInt()
  // entityId: number;
  // @ApiProperty({ description: 'Тип Сущности Реакции', required: true, enum: ['track', 'album', 'file'], })
  // @IsNotEmpty()
  // @IsString()
  // @IsEnum(['track', 'album', 'file'])
  // entityType: 'track' | 'album' | 'file';

  // ^ Раздел.Реакции. ID Файла/Трека/Альбома
  @ApiProperty({ description: 'ID Файла', required: false })
  @IsOptional()
  @IsInt()
  fileId?: number;
  @ApiProperty({ description: 'ID Трека', required: false })
  @IsOptional()
  @IsInt()
  trackId?: number;
  @ApiProperty({ description: 'ID Альбома', required: false })
  @IsOptional()
  @IsInt()
  albumId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID родительской Реакции',
    required: false,
  })
  @IsOptional()
  @IsInt()
  parentReactionId?: number;
}
