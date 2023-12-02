// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackDto {
  // декор.swagger > св-в с возм.указ. default
  @ApiProperty({ default: 'Название трк.#' })
  name: string;

  @ApiProperty({ default: 'Артист #' })
  artist: string;

  @ApiProperty({ default: 'Текст #' })
  text: string;

  @ApiProperty({ default: 'Other #' })
  style: string;

  // добав. userId и albumId

  // ф.перед.отд.
  // audio: string;
  // picture: string;
}
