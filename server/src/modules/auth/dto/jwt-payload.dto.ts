import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class JwtPayloadDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number | string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
