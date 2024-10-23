import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { FileEntity } from './entities/file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import { isProduction } from '../../config/envs/env.consts';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [UserEntity, RoleEntity, FileEntity, TrackEntity, AlbumEntity],

      isProduction ? 'supabase' : 'localhost',
    ),
  ],
  controllers: [FilesController],
  providers: [FilesService, DatabaseUtils, LoggingWinston],
  exports: [FilesService],
})
export class FilesModule {}
