export class CreateTrackDto {
  // доп.декор для поним.swagger какие есть св-ва. Можно указ.знач.по умолч. в {default:''}
  // @ApiProperty({
  // default: 'Тест Тестович',
  // })
  name: string;
  artist: string;
  text: string;
  // ф.перед.отд.
  // audio: string;
  // userid: number;
}
