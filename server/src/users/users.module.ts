import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { TrackModule } from 'src/track/track.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    // ч/з TypeOrmModule.`для функции` подкл.UserEntity для раб.с табл.users
    TypeOrmModule.forFeature([UserEntity]),
    // подкл.использ.modulи
    TrackModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  // export UsersService для видимости вне modulя (напр.в AuthService)
  exports: [UsersService],
})
export class UsersModule {}
