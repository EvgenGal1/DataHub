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
  text?: string;

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

  @ApiProperty({
    example: 'track',
    description: 'Тип объекта Реакция',
    required: true,
    enum: ['track', 'album', 'file'],
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['track', 'album', 'file'])
  reactionType: 'track' | 'album' | 'file';

  @ApiProperty({
    example: 12,
    description: 'ID объекта Реакции',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  reactionId: number;
}
