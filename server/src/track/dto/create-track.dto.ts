// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей
import { ApiProperty } from '@nestjs/swagger';
import { AlbumEntity } from 'src/album/entities/album.entity';

export class CreateTrackDto {
  // декор.swagger > св-в с возм.указ. default
  @ApiProperty({ default: 'Название трк.#' })
  readonly name: string;

  @ApiProperty({ default: 'Артист #' })
  readonly artist: string;

  @ApiProperty({ default: 'Текст #' })
  readonly text: string;

  @ApiProperty({ default: 'Other #' })
  readonly style: string;

  @ApiProperty({ default: 'Альбом #' })
  readonly album: string | AlbumEntity;

  // добав. userId и albumId

  // ф.перед.отд.
  // audio: string;
  // picture: string;
}
