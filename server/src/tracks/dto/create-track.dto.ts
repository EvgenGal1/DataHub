// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackDto {
  // декор.swagger > св-в с возм.указ. default
  @ApiProperty({ default: 'Название трк.#' })
  /* static name: string */
  name: string = 'Название трк.#';

  @ApiProperty({ default: 'Артист #' })
  /* readonly artist: string */
  artist: string = 'Артист #';

  @ApiProperty({ default: 'Текст #' })
  text: string = 'Текст #';

  @ApiProperty({ default: 'Other #' })
  style: string = 'Other #';

  constructor(name?: string, text?: string, style?: string, artist?: string) {
    if (name) this.name = name;
    if (text) this.text = text;
    if (style) this.style = style;
    if (artist) this.artist = artist;
  }

  // для учитывания динамических свойств при измен. TracksService.templateTrackDto
  // [key: string]: any;

  // добав. userId и albumId

  // ф.перед.отд.
  // audio: string;
  // picture: string;
}
