import { ApiProperty } from '@nestjs/swagger';

export class CreateAlbumDto {
  @ApiProperty({ default: 'Альбом #' })
  name: string;

  @ApiProperty({ default: 'Артист #' })
  author: string;
}
