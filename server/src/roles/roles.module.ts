import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRolesEntity } from './entities/user-roles.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { FileEntity } from '../files/entities/file.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { DatabaseUtils } from '../utils/database.utils';

@Module({
  controllers: [RolesController],
  providers: [RolesService, DatabaseUtils],
  imports: [
    TypeOrmModule.forFeature(
      [
        UserEntity,
        RoleEntity,
        UserRolesEntity,
        FileEntity,
        TrackEntity,
        AlbumEntity,
      ],
      'supabase',
    ),
    ...(process.env.NODE_ENV !== 'production'
      ? [
          TypeOrmModule.forFeature(
            [
              UserEntity,
              RoleEntity,
              UserRolesEntity,
              FileEntity,
              TrackEntity,
              AlbumEntity,
            ],
            'localhost',
          ),
        ]
      : []),
  ],
  exports: [RolesService],
})
export class RolesModule {}
