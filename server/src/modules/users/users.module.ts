import { Module /* , forwardRef */ } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesModule } from '../roles/roles.module';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { FileEntity } from '../files/entities/file.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
// утилиты Общ.
import { BasicUtils } from '../../common/utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';
// константы > команды запуска process.env.NODE_ENV
import { isProduction } from '../../config/envs/env.consts';

@Module({
  imports: [
    // ч/з TypeOrmModule.`для функции` подкл.UserEntity и пр. для раб.с табл.users и пр.
    // ^ подкл.неск.БД. PROD или DEV
    TypeOrmModule.forFeature(
      [
        UserEntity,
        RoleEntity,
        UserRolesEntity,
        FileEntity,
        TrackEntity,
        AlbumEntity,
      ],
      isProduction ? 'supabase' : 'localhost',
    ),
    // подкл.использ.modulи
    RolesModule,
    // forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, BasicUtils, DatabaseUtils, LoggingWinston],
  // exp. UsersService для видимости вне modul (напр.в AuthService)
  exports: [UsersService],
})
export class UsersModule {}
