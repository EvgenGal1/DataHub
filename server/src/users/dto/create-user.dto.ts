// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей
// import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  // доп.декор для поним.swagger какие есть св-ва. Можно указ.знач.по умолч. в {default:''}
  // @ApiProperty({
  // default: 'Test@Test.ru',
  // })
  email: string;

  // @ApiProperty({
  // default: '123_Test',
  // })
  password: string;

  // @ApiProperty({
  // default: 'Тест Тестович',
  // })
  fullname: string;
}
