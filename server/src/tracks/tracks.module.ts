import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { TrackController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { TrackEntity } from './entities/track.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { AlbumsService } from '../albums/albums.service';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
// утилиты Общие
import { BasicUtils } from '../utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../utils/database.utils';
// логи
import { WinstonLoggerProvider } from '../config/winston-logger.config';
// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../config/envs/env.consts';

@Module({
  imports: [
    // ^ подкл.неск.БД.
    // ^ PROD или Total > БД SupaBase
    ...(isProduction || isTotal
      ? [
          TypeOrmModule.forFeature(
            [
              TrackEntity,
              UserEntity,
              RoleEntity,
              ReactionEntity,
              AlbumEntity,
              FileEntity,
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
              TrackEntity,
              UserEntity,
              RoleEntity,
              ReactionEntity,
              AlbumEntity,
              FileEntity,
            ],
            'localhost',
          ),
        ]
      : []),
  ],
  controllers: [TrackController],
  providers: [
    TracksService,
    AlbumsService,
    FilesService,
    DatabaseUtils,
    BasicUtils,
    WinstonLoggerProvider,
  ],
  exports: [TracksService],
})
export class TrackModule {}
