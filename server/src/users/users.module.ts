/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { TrackModule } from 'src/track/track.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { UserRolesEntity } from 'src/roles/entities/user-roles.entity';

@Module({
  imports: [
    // ч/з TypeOrmModule.`для функции` подкл.UserEntity для раб.с табл.users
    TypeOrmModule.forFeature([UserEntity, RoleEntity, UserRolesEntity]),
    // подкл.использ.modulи
    TrackModule,
    RolesModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  // exp. UsersService для видимости вне modulя (напр.в AuthService)
  exports: [UsersService],
})
export class UsersModule {}
