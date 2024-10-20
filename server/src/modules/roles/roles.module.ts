import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRolesEntity } from './entities/user-roles.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { FileEntity } from '../files/entities/file.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../../config/envs/env.consts';

@Module({
  imports: [
    ...(isProduction || isTotal
      ? [
          TypeOrmModule.forFeature(
            [
              UserEntity,
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
    ...(isDevelopment || isTotal
      ? [
          TypeOrmModule.forFeature(
            [
              UserEntity,
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
  ],
  controllers: [RolesController],
  providers: [RolesService, DatabaseUtils, LoggingWinston],
  exports: [RolesService],
})
export class RolesModule {}
