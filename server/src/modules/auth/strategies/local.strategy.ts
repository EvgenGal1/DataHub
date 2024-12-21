// ^ стратегия аутентификации с помощью логина и пароля

import { Controller, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthDto } from '../dto/auth.dto';
import { UserDto } from '../../../modules/users/dto/user.dto';
import { AuthService } from '../auth.service';

@Injectable()
@Controller('local')
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // соответствие полей в запросе
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(payload: AuthDto): Promise<UserDto> {
    const user = await this.authService.validateUser(payload);

    return user;
  }
}
