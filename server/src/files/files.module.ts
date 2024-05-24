import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { DatabaseUtils } from '../utils/database.utils';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';

@Module({
  controllers: [FilesController],
  providers: [FilesService, DatabaseUtils],
  // подкл.FileEntity ч/з TypeOrmModule в import для раб.с табл.files, users, roles, tracks
  imports: [
    TypeOrmModule.forFeature(
      [FileEntity, AlbumEntity, UserEntity, RoleEntity, TrackEntity],
      'supabase',
    ),
    ...(process.env.NODE_ENV === 'development'
      ? [
          TypeOrmModule.forFeature(
            [FileEntity, AlbumEntity, UserEntity, RoleEntity, TrackEntity],
            'localhost',
          ),
        ]
      : []),
  ],
  exports: [FilesService],
})
export class FilesModule {}
