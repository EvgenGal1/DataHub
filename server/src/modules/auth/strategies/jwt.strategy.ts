import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';
import { LoggingWinston } from '../../../config/logging/log_winston.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly logger: LoggingWinston,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: /* process.env.JWT_SECRET */ configService.get('JWT_SECRET'), // Используем секрет из ConfigService
    });
  }

  // получ. Пользователя по ID из payload
  async validate(payload: any) {
    return this.usersService.findOneUser(payload.sub);
  }
}
