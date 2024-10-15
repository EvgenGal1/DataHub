import { Module /* , forwardRef */ } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesModule } from '../roles/roles.module';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { FileEntity } from '../files/entities/file.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
// логгирование LH
import { LoggingWinston } from '../../services/logging/logging.winston';
// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../../config/envs/env.consts';

@Module({
  imports: [
    // ч/з TypeOrmModule.`для функции` подкл.UserEntity и пр. для раб.с табл.users и пр.
    // ^ подкл.неск.БД.
    // ^ PROD или Total > БД SupaBase
    ...(isProduction || isTotal
      ? [
          TypeOrmModule.forFeature(
            [
              // UserEntity,
              RoleEntity,
              UserRolesEntity,
              FileEntity,
              TrackEntity,
              AlbumEntity,
            ],
            'supabase',
          ),
        ]
      : []),
    // ^ DEV или Total > БД LocalHost
    ...(isDevelopment || isTotal
      ? [
          TypeOrmModule.forFeature(
            [
              // UserEntity,
              RoleEntity,
              UserRolesEntity,
              FileEntity,
              TrackEntity,
              AlbumEntity,
            ],
            'localhost',
          ),
        ]
      : []),
    // подкл.использ.modulи
    RolesModule,
    // forwardRef(() => AuthModule),
  ],
  controllers: [ReactionsController],
  providers: [ReactionsService, LoggingWinston],
})
export class ReactionsModule {}
