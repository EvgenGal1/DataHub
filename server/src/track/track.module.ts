import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrackEntity } from './entities/track.entity';
import { CommentEntity } from './entities/comment.entity';
import { AlbumEntity } from 'src/album/entities/album.entity';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackEntity]),
    TypeOrmModule.forFeature([CommentEntity]),
    TypeOrmModule.forFeature([AlbumEntity]),
  ],
  exports: [TypeOrmModule.forFeature([CommentEntity])],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
