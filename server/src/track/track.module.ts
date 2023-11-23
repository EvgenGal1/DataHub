import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrackEntity } from './entities/track.entity';
import { CommentEntity } from './entities/comment.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { AlbumEntity } from 'src/album/entities/album.entity';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { FileEntity } from 'src/files/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackEntity,
      CommentEntity,
      UserEntity,
      FileEntity,
      AlbumEntity,
    ]),
  ],
  exports: [TrackService /* TypeOrmModule.forFeature([CommentEntity]) */],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
