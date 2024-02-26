import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRolesEntity } from './entities/user-roles.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { DatabaseUtils } from 'src/utils/database.utils';
import { FileEntity } from 'src/files/entities/file.entity';
import { TrackEntity } from 'src/tracks/entities/track.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService, DatabaseUtils],
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      UserEntity,
      UserRolesEntity,
      FileEntity,
      TrackEntity,
    ]),
  ],
  exports: [RolesService],
})
export class RolesModule {}
