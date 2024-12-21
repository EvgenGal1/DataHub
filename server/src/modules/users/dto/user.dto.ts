// ^ `Объект передачи данных` разрещ.req front > dack. Отдел.кл.с опис.ожид.св-в/полей

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Length,
  Matches,
  IsOptional,
  IsIn,
  IsNumber,
} from 'class-validator';

export class UserDto {
  id: number;

  @ApiProperty({
    example: 'Тест Тестович',
    description: 'Полное Имя Пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'Полное Имя не должно быть пустым' })
  @IsString({ message: 'Полное Имя должно быть строкой' })
  @Length(2, 50, { message: 'Полное Имя должно быть от 2 до 50 символов' })
  readonly fullName: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'Email Пользователя',
    required: true,
  })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  @IsString({ message: 'Email должен быть строкой' })
  @Length(2, 128, { message: 'Email должно быть от 2 до 128 символов' })
  @IsEmail({}, { message: 'Некорректный Email' })
  readonly email: string;

  @ApiProperty({
    example: 'qdfvg.reth6k-fe3b',
    description: 'Ссылка активации аккаунта через Почту',
  })
  @IsOptional()
  @IsString({ message: 'Ссылка должна быть строкой' })
  readonly activatedLink?: string;

  @ApiProperty({
    example: 1,
    description: 'ID Аватара Пользователя',
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID должен быть числом' })
  readonly coverArtId?: number;

  @ApiProperty({
    example: [1, 2],
    description: 'ID Ролей Пользователя (может быть один или несколько)',
  })
  @IsOptional()
  @IsIn([Number, Array], { message: 'Должно быть числом или массивом чисел' })
  // ! ошб.в UPD users.service.ts:248:7 - error TS2322: Type 'UserEntity' is not assignable to type 'UserDto'.   Types of property 'roles' are incompatible.     Type 'RoleEntity[]' is not assignable to type 'string | string[]'.      Type 'RoleEntity[]' is not assignable to type 'string[]'.          Type 'RoleEntity' is not assignable to type 'string'.
  readonly roles?: string | string[] | any;
}
