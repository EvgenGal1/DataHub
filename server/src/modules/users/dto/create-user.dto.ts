// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Length, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  // доп.декор swagger по св-вам. Можно указ.знач.по умолч. в {default:''}
  @ApiProperty({ default: 'Test@Test.ru', description: 'Email' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  readonly email: string;

  @ApiProperty({ default: '123_Test', description: 'Пароль' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Не меньше 4 и не больше 16' })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  readonly password: string;

  @ApiProperty({ default: 'Тест Тестович', description: 'Полное Имя' })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Полное Имя не должно быть пустым' })
  readonly fullName: string;
}
