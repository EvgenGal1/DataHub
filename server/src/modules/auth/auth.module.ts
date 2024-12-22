import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './token.service';
import { AuthEntity } from './entities/auth.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { FileEntity } from '../files/entities/file.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LocalStrategy } from './strategies/local.strategy';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Module({
  imports: [
    // подкл.БД user
    TypeOrmModule.forFeature(
      [
        AuthEntity,
        UserEntity,
        RoleEntity,
        UserRolesEntity,
        FileEntity,
        TrackEntity,
        AlbumEntity,
        ReactionEntity,
      ],
      process.env.DB_NAM,
    ),
    // асинхр.настр.JWT
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('REF_T_SECRET'), // секрет.ключ > подписи JWT
        signOptions: {
          expiresIn: configService.get('REF_T_EXPIRES'),
        }, // срок действия Токена
      }),
    }),
    // раб.с аутентификацией
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    LocalStrategy,
    UsersService,
    BasicUtils,
    DatabaseUtils,
    LoggingWinston,
  ],
  exports: [AuthService, JwtStrategy, LocalStrategy, JwtModule],
})
export class AuthModule {}
