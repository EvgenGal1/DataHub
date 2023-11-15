import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/entities/user.entity';
import { TrackModule } from './track/track.module';
import { TrackEntity } from './track/entities/track.entity';
import { CommentEntity } from './track/entities/comment.entity';
// import { AlbumModule } from './album/album.module';
import { AppController, AppController2 } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // подкл.модуль для счит.перем.из.env
    ConfigModule.forRoot(),
    // подкл.к БД ч/з перем.process.env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // указ.сущн. для авто.синхронз.измен. ч/з TypeOrmModule
      entities: [UserEntity, TrackEntity, CommentEntity],
      synchronize: true,
    }),
    // подкл.использ.modulи
    // AuthModule,
    UsersModule,
    TrackModule,
    // AlbumModule,
  ],
  controllers: [AppController, AppController2],
  providers: [AppService],
})
export class AppModule {}
