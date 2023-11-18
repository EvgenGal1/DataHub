// import { ObjectId } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ default: 'коммент #' })
  text: string;

  @ApiProperty({ default: 111 })
  trackId: number; // ObjectId;

  @ApiProperty({ default: 111 })
  userId: number; // ObjectId;
}
