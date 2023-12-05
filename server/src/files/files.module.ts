import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { DatabaseUtils } from 'src/utils/database.utils';
import { TrackEntity } from 'src/track/entities/track.entity';

@Module({
  controllers: [FilesController],
  providers: [FilesService, DatabaseUtils],
  // подкл.FileEntity ч/з TypeOrmModule в import для раб.с табл.filesб users, roles, tracks
  imports: [
    TypeOrmModule.forFeature([FileEntity, UserEntity, RoleEntity, TrackEntity]),
  ],
  exports: [FilesService],
})
export class FilesModule {}
