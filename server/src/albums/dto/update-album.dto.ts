import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { CreateAlbumDto } from './create-album.dto';

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {
  @ApiProperty({ default: 'Альбом #' })
  title: string = 'Назв.Алб. #';

  @ApiProperty({ default: 'Аффтор #' })
  author: string = 'Аффтор #';

  @ApiProperty({ default: null })
  year: number = null;

  @ApiProperty({ default: 'Other #' })
  genres: string = 'Other #';

  @ApiProperty({ default: './images' })
  path: string = './images';

  @ApiProperty({ default: null })
  cover?: boolean | number;
}
