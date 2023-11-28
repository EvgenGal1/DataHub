import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { TrackEntity } from './entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { AlbumEntity } from 'src/album/entities/album.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';

@Module({
  controllers: [TrackController],
  providers: [TrackService],
  imports: [
    TypeOrmModule.forFeature([
      TrackEntity,
      ReactionEntity,
      UserEntity,
      FileEntity,
      AlbumEntity,
    ]),
  ],
  exports: [TrackService],
})
export class TrackModule {}
