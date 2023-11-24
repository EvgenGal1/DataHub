import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleEntity } from './entities/role.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      UserEntity /* , UserRoles // нужна ли отд.табл.связи */,
    ]),
  ],
  exports: [RolesService],
})
export class RolesModule {}
