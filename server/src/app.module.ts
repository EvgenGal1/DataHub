// общ.модуль приложения
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController, AppController2 } from './app.controller.js';
import { AppService } from './app.service.js';
// import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { FilesModule } from './files/files.module';
import { TrackModule } from './tracks/tracks.module';
import { AlbumModule } from './albums/albums.module';
import { ReactionsModule } from './reactions/reactions.module';
// БД. config
import localhostConfig from './config/envs/localhost.config.js';
import supabaseConfig from './config/envs/supabase.config.js';

// декор.модуль. (организ.структуры области действ.> cntrl и provider)
@Module({
  imports: [
    // подкл.конфиг.модуль > счит.перем.из.env
    ConfigModule.forRoot({
      // путь к ф.конфиг. (по умолч.ищет в корне .env)
      envFilePath: `.env.${process.env.NODE_ENV}`,
      // глоб.видим.
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'localhost',
      useFactory: localhostConfig,
    }),
    TypeOrmModule.forRootAsync({
      name: 'supabase',
      useFactory: supabaseConfig,
    }),
    // обслуж.статич.контент по путь/папка ч/з веб-сайт
    ServeStaticModule.forRoot({
      rootPath: `${__dirname}/../static`,
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
  // подкл.cnrtl данного модуля
  controllers: [AppController, AppController2],
  // подкл.serv данного модуля
  providers: [AppService],
})
export class AppModule {}
