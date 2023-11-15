import { ObjectId } from 'typeorm';

export class CreateCommentDto {
  username: string;
  text: string;
  trackId: ObjectId;
}
