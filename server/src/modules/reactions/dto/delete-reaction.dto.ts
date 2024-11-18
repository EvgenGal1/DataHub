import { ApiProperty } from '@nestjs/swagger';

export class DeleteReactionDto {
  @ApiProperty({
    example: 1,
    description: 'ID Реакции',
    required: true,
  })
  id: number;
}
