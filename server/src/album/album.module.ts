import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrackEntity } from 'src/track/entities/track.entity';
import { CommentEntity } from 'src/track/entities/comment.entity';
import { AlbumEntity } from './entities/album.entity';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { FileEntity } from 'src/files/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackEntity,
      CommentEntity,
      AlbumEntity,
      FileEntity,
    ]),
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
})
export class AlbumModule {}
