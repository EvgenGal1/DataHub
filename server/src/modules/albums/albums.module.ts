import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { TrackEntity } from '../tracks/entities/track.entity';
import { TracksService } from '../tracks/tracks.service';
import { AlbumEntity } from './entities/album.entity';
import { AlbumController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../services/logging/logging.winston';
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
              FileEntity,
              TrackEntity,
              AlbumEntity,
              ReactionEntity,
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
              FileEntity,
              TrackEntity,
              AlbumEntity,
              ReactionEntity,
            ],
            'localhost',
          ),
        ]
      : []),
  ],
  controllers: [AlbumController],
  providers: [
    FilesService,
    TracksService,
    AlbumsService,
    BasicUtils,
    DatabaseUtils,
    LoggingWinston,
  ],
  exports: [AlbumsService],
})
export class AlbumModule {}
