import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from 'src/tracks/entities/track.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { TracksService } from 'src/tracks/tracks.service';
import { FilesService } from 'src/files/files.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { DatabaseUtils } from 'src/utils/database.utils';
import { BasicUtils } from 'src/utils/basic.utils';

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
      'localhost',
    ),
  ],
  exports: [AlbumsService],
})
export class AlbumModule {}
