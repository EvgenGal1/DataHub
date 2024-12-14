import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { FileEntity } from './entities/file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Module({
  imports: [
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
  controllers: [FilesController],
  providers: [FilesService, BasicUtils, DatabaseUtils, LoggingWinston],
  exports: [FilesService],
})
export class FilesModule {}
