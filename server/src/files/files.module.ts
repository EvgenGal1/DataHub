import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { DatabaseUtils } from 'src/utils/database.utils';
import { TrackEntity } from 'src/tracks/entities/track.entity';
import { AlbumEntity } from 'src/albums/entities/album.entity';

@Module({
  controllers: [FilesController],
  providers: [FilesService, DatabaseUtils],
  // подкл.FileEntity ч/з TypeOrmModule в import для раб.с табл.files, users, roles, tracks
  imports: [
    TypeOrmModule.forFeature(
      [FileEntity, AlbumEntity, UserEntity, RoleEntity, TrackEntity],
      'localhost',
    ),
  ],
  exports: [FilesService],
})
export class FilesModule {}
