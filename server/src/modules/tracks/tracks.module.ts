import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { TrackEntity } from './entities/track.entity';
import { TrackController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { AlbumEntity } from '../albums/entities/album.entity';
import { AlbumsService } from '../albums/albums.service';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
// утилиты общ.
import { BasicUtils } from '../../common/utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Module({
  imports: [
    // ^ подкл.неск.БД от NODE_ENV. PROD или DEV
    TypeOrmModule.forFeature(
      [
        UserEntity,
        RoleEntity,
        FileEntity,
        TrackEntity,
        AlbumEntity,
        ReactionEntity,
      ],
      process.env.DB_NAM,
    ),
  ],
  controllers: [TrackController],
  providers: [
    FilesService,
    TracksService,
    AlbumsService,
    BasicUtils,
    DatabaseUtils,
    LoggingWinston,
  ],
  exports: [TracksService],
})
export class TrackModule {}
