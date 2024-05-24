import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { FileEntity } from '../files/entities/file.entity';
import { TracksService } from '../tracks/tracks.service';
import { FilesService } from '../files/files.service';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { DatabaseUtils } from '../utils/database.utils';
import { BasicUtils } from '../utils/basic.utils';

@Module({
  controllers: [AlbumController],
  providers: [
    AlbumsService,
    TracksService,
    FilesService,
    DatabaseUtils,
    BasicUtils,
  ],
  imports: [
    TypeOrmModule.forFeature(
      [
        TrackEntity,
        UserEntity,
        ReactionEntity,
        AlbumEntity,
        FileEntity,
        RoleEntity,
      ],
      'supabase',
    ),
    ...(process.env.NODE_ENV === 'development'
      ? [
          TypeOrmModule.forFeature(
            [
              TrackEntity,
              UserEntity,
              ReactionEntity,
              AlbumEntity,
              FileEntity,
              RoleEntity,
            ],
            'localhost',
          ),
        ]
      : []),
  ],
  exports: [AlbumsService],
})
export class AlbumModule {}
