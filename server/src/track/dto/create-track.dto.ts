// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackDto {
  // декор.swagger > св-в с возм.указ. default
  @ApiProperty({
    default: 'Название 1',
  })
  name: string;

  @ApiProperty({
    default: 'Артист 1',
  })
  artist: string;

  @ApiProperty({
    default: 'Текст 1',
  })
  text: string;

  // ф.перед.отд.
  // audio: string;
  // userid: number;
}
