import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { DatabaseUtils } from '../../utils/database.utils';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
// логи
import { WinstonLoggerProvider } from '../../config/winston-logger.config';
// константы > команды запуска process.env.NODE_ENV
import {
  isDevelopment,
  isProduction,
  isTotal,
} from '../../config/envs/env.consts';

@Module({
  // подкл.FileEntity ч/з TypeOrmModule в import для раб.с табл.files, users, roles, tracks
  imports: [
    // ^ PROD или Total > БД SupaBase
    ...(isProduction || isTotal
      ? [
          TypeOrmModule.forFeature(
            [FileEntity, AlbumEntity, UserEntity, RoleEntity, TrackEntity],
            'supabase',
          ),
        ]
      : []),
    // ^ DEV или Total > БД LocalHost
    ...(isDevelopment || isTotal
      ? [
          TypeOrmModule.forFeature(
            [FileEntity, AlbumEntity, UserEntity, RoleEntity, TrackEntity],
            'localhost',
          ),
        ]
      : []),
  ],
  controllers: [FilesController],
  providers: [FilesService, DatabaseUtils, WinstonLoggerProvider],
  exports: [FilesService],
})
export class FilesModule {}
