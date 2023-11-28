import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
  @ApiProperty({ default: 'коммент #' })
  text: string;

  @ApiProperty({ default: 111 })
  trackId: number;

  @ApiProperty({ default: 111 })
  userId: number;
}
