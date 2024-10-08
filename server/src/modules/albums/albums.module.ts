import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { FileEntity } from '../files/entities/file.entity';
import { TracksService } from '../tracks/tracks.service';
import { FilesService } from '../files/files.service';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
// import { WinstonLoggerProvider } from '../../config/winston-logger.config';
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
              TrackEntity,
              UserEntity,
              ReactionEntity,
              AlbumEntity,
              FileEntity,
              RoleEntity,
            ],
            'supabase',
          ),
        ]
      : []),
    ...(isDevelopment || isTotal
      ? [
          TypeOrmModule.forFeature(
            [
              TrackEntity,
              UserEntity,
              ReactionEntity,
              AlbumEntity,
              FileEntity,
              RoleEntity,
            ],
            'localhost',
          ),
        ]
      : []),
  ],
  controllers: [AlbumController],
  providers: [
    AlbumsService,
    TracksService,
    FilesService,
    DatabaseUtils,
    BasicUtils,
    // WinstonLoggerProvider,
  ],
  exports: [AlbumsService],
})
export class AlbumModule {}
