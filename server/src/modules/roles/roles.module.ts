import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthEntity } from '../auth/entities/auth.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RoleEntity } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UserRolesEntity } from './entities/user-roles.entity';
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
  controllers: [RolesController],
  providers: [
    // AuthService,
    UsersService,
    RolesService,
    BasicUtils,
    DatabaseUtils,
    LoggingWinston,
  ],
  exports: [RolesService],
})
export class RolesModule {}
