// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей
import { ApiProperty } from '@nestjs/swagger';

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

  // добав. userId и albumId

  // ф.перед.отд.
  // audio: string;
  // picture: string;
}
