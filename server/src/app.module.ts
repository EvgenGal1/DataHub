// общ.модуль приложения
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AppController, AppController2 } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/entities/user.entity';
import { RolesModule } from './roles/roles.module';
import { RoleEntity } from './roles/entities/role.entity';
import { UserRolesEntity } from './roles/entities/user-roles.entity';
import { FilesModule } from './files/files.module';
import { FileEntity } from './files/entities/file.entity';
import { TrackModule } from './tracks/tracks.module';
import { TrackEntity } from './tracks/entities/track.entity';
import { AlbumModule } from './albums/albums.module';
import { AlbumEntity } from './albums/entities/album.entity';
import { ReactionsModule } from './reactions/reactions.module';
import { ReactionEntity } from './reactions/entities/reaction.entity';

// декор.модуль. (организ.структуры области действ.> cntrl и provider)
@Module({
  imports: [
    // подкл.модуль > счит.перем.из.env
    ConfigModule.forRoot({
      // путь к ф.конфиг. (по умолч.ищет в корне .env)
      envFilePath: '.env',
      // повысить производитюдоступа к перем.в process.env.
      cache: true,
    }),
    // подкл.к БД ч/з перем.process.env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('ELEPHANT_PG_HOST'),
        port: Number(configService.get('ELEPHANT_PG_PORT')) || 5432,
        database: configService.get('ELEPHANT_PG_DB'),
        username: configService.get('ELEPHANT_PG_USER'),
        password: configService.get('ELEPHANT_PG_PSW'),
        entities: [
          UserEntity,
          RoleEntity,
          UserRolesEntity,
          FileEntity,
          TrackEntity,
          AlbumEntity,
          ReactionEntity,
        ],
        // ^^ ТОЛЬКО DEV true
        // синхрон.табл.БД, логи сборки
        // ! при true начала падать в ошб. - ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)... QueryFailedError: максимальное число столбцов в таблице: 1600
        synchronize: false,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    // обслуж.статич.контент по путь/папка ч/з веб-сайт
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, /* '..', */ 'static'),
      serveRoot: '/static',
    }),
    // подкл.использ.modulи
    // AuthModule,
    UsersModule,
    RolesModule,
    FilesModule,
    TrackModule,
    AlbumModule,
    ReactionsModule,
  ],
  // ^^ подкл.App.cnrtl,serv до декомпозиции (для кажд.сущности свой cntrl,serv )
  // подкл.cnrtl данного модуля
  controllers: [AppController, AppController2],
  // подкл.serv данного модуля
  providers: [AppService],
})
export class AppModule {}
