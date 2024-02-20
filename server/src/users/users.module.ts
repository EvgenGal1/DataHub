import { Module /* , forwardRef */ } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { UserRolesEntity } from 'src/roles/entities/user-roles.entity';
import { DatabaseUtils } from 'src/utils/database.utils';
import { FileEntity } from 'src/files/entities/file.entity';
import { TrackEntity } from 'src/track/entities/track.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService, DatabaseUtils],
  imports: [
    // ч/з TypeOrmModule.`для функции` подкл.UserEntity и пр. для раб.с табл.users и пр.
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      UserRolesEntity,
      FileEntity,
      TrackEntity,
    ]),
    // подкл.использ.modulи
    RolesModule,
    // forwardRef(() => AuthModule),
  ],
  // exp. UsersService для видимости вне modulя (напр.в AuthService)
  exports: [UsersService],
})
export class UsersModule {}
