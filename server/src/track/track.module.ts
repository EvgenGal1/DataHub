import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { TrackEntity } from './entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { AlbumEntity } from 'src/album/entities/album.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { FilesService } from 'src/files/files.service';
import { DatabaseUtils } from 'src/utils/database.utils';

@Module({
  controllers: [TrackController],
  providers: [TrackService, FilesService, DatabaseUtils],
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
  exports: [TrackService],
})
export class TrackModule {}
