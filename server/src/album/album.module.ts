import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrackEntity } from 'src/track/entities/track.entity';
import { CommentEntity } from 'src/track/entities/comment.entity';
import { AlbumEntity } from './entities/album.entity';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackEntity]),
    TypeOrmModule.forFeature([CommentEntity]),
    TypeOrmModule.forFeature([AlbumEntity]),
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
})
export class AlbumModule {}
