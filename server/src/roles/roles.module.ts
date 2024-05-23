import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRolesEntity } from './entities/user-roles.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { DatabaseUtils } from '../utils/database.utils';
import { FileEntity } from '../files/entities/file.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService, DatabaseUtils],
  imports: [
    TypeOrmModule.forFeature(
      [
        RoleEntity,
        UserEntity,
        UserRolesEntity,
        FileEntity,
        TrackEntity,
        AlbumEntity,
      ],
      'localhost',
    ),
  ],
  exports: [RolesService],
})
export class RolesModule {}
