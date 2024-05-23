import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { TrackController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { TrackEntity } from './entities/track.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { AlbumsService } from '../albums/albums.service';
import { FileEntity } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { DatabaseUtils } from '../utils/database.utils';
import { BasicUtils } from '../utils/basic.utils';

@Module({
  controllers: [TrackController],
  providers: [
    TracksService,
    AlbumsService,
    FilesService,
    DatabaseUtils,
    BasicUtils,
  ],
  imports: [
    TypeOrmModule.forFeature(
      [
        TrackEntity,
        UserEntity,
        RoleEntity,
        ReactionEntity,
        AlbumEntity,
        FileEntity,
      ],
      'localhost',
    ),
  ],
  exports: [TracksService],
})
export class TrackModule {}
