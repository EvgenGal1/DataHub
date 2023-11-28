import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { TrackEntity } from 'src/track/entities/track.entity';
import { AlbumEntity } from './entities/album.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';

@Module({
  controllers: [AlbumController],
  providers: [AlbumService],
  imports: [
    TypeOrmModule.forFeature([
      TrackEntity,
      ReactionEntity,
      AlbumEntity,
      FileEntity,
    ]),
  ],
})
export class AlbumModule {}
