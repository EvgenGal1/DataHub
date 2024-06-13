import { ApiProperty } from '@nestjs/swagger';

export class TotalAlbumDto {
  @ApiProperty({ default: '0:00' })
  readonly total_duration?: string;

  @ApiProperty({ default: 1 })
  readonly total_tracks?: number;

  @ApiProperty({ default: 'Other #' })
  readonly genres?: string = 'Other #';

  @ApiProperty({ default: '2022-02-22 00:11:23' })
  readonly deletedAt?: Date;
}
