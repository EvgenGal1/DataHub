// ^ стратегия аутентификации с помощью логина и пароля

import { Controller, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
// логгирование LH
import { LoggingWinston } from '../../../config/logging/log_winston.config';

@Injectable()
@Controller('local')
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggingWinston,
  ) {
    super({
      // соответствие полей в запросе
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<number> {
    this.logger.debug(`LocalStrategy eml/psw '${email}'/'${password}'`);
    const user = await this.authService.validateUser({ email, password });
    return user.id;
  }
}
