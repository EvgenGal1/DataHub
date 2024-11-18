import { ApiProperty } from '@nestjs/swagger';
import { ReactionEntity } from '../entities/reaction.entity';

export class GetReactionDto {
  @ApiProperty({ type: [ReactionEntity] })
  reactions: ReactionEntity[];
}
