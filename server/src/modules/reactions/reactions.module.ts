import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthEntity } from '../auth/entities/auth.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { FileEntity } from '../files/entities/file.entity';
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
        AuthEntity,
        UserEntity,
        RoleEntity,
        UserRolesEntity,
        FileEntity,
        TrackEntity,
        AlbumEntity,
        ReactionEntity,
      ],
      process.env.DB_NAM,
    ),
  ],
  controllers: [ReactionsController],
  providers: [
    RolesService,
    ReactionsService,
    BasicUtils,
    DatabaseUtils,
    LoggingWinston,
  ],
  exports: [ReactionsService],
})
export class ReactionsModule {}
