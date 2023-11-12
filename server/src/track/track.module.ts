import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrackEntity } from './entities/track.entity';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { CommentEntity } from './entities/comment.entity';

@Module({
  // подкл.TrackEntity ч/з TypeOrmModule в import для раб.с табл.track
  imports: [
    TypeOrmModule.forFeature([TrackEntity]),
    TypeOrmModule.forFeature([CommentEntity]),
  ],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
