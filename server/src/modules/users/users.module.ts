import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from '../auth/entities/auth.entity';
// import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
// утилиты общ.
import { BasicUtils } from '../../common/utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Module({
  imports: [
    // ч/з TypeOrmModule.`для функции` подкл.UserEntity и пр. для раб.с табл.users и пр.
    // ^ подкл.неск.БД от NODE_ENV. PROD или DEV
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
    // AuthModule,
    // подкл.использ.modul // Используйте forwardRef, если AuthModule обращается к UsersModule и наоборот // Позволяет разрешить циклическую зависимость
    // forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    AuthService,
    JwtService,
    UsersService,
    RolesService,
    FilesService,
    BasicUtils,
    DatabaseUtils,
    LoggingWinston,
  ],
  // exp. UsersService для видимости вне modul (напр.в AuthService)
  exports: [UsersService],
})
export class UsersModule {}
