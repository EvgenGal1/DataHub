import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { FileEntity } from '../files/entities/file.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import { isProduction } from '../../config/envs/env.consts';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        // UserEntity,
        RoleEntity,
        UserRolesEntity,
        FileEntity,
        TrackEntity,
        AlbumEntity,
      ],
      isProduction ? 'supabase' : 'localhost',
    ),
  ],
  controllers: [ReactionsController],
  providers: [RolesService, ReactionsService, DatabaseUtils, LoggingWinston],
})
export class ReactionsModule {}
