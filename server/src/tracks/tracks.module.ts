import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { TrackController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { TrackEntity } from './entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { AlbumEntity } from 'src/albums/entities/album.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { FilesService } from 'src/files/files.service';
import { DatabaseUtils } from 'src/utils/database.utils';
import { AlbumsService } from 'src/albums/albums.service';

@Module({
  controllers: [TrackController],
  providers: [TracksService, AlbumsService, FilesService, DatabaseUtils],
  imports: [
    TypeOrmModule.forFeature([
      TrackEntity,
      UserEntity,
      RoleEntity,
      ReactionEntity,
      AlbumEntity,
      FileEntity,
    ]),
  ],
  exports: [TracksService],
})
export class TrackModule {}
