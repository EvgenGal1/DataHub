import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: /* process.env.JWT_SECRET */ config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    PassportModule,
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, LoggingWinston],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
