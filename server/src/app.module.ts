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
import { localhostConfig } from './config/envs/localhost.config.js';
import { supabaseConfig } from './config/envs/supabase.config.js';
// логи
import { WinstonLoggerProvider } from './config/winston-logger.config.js';
// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from './config/envs/env.consts.js';

// декор.модуль. (организ.структуры области действ.> cntrl и provider)
@Module({
  imports: [
    // подкл.конфиг.модуль > счит.перем.из.env
    ConfigModule.forRoot({
      // условн.путь к ф.конфиг.
      envFilePath:
        // ['.env.development', '.env.production'],
        isProduction ? `.env.${process.env.NODE_ENV}` : '.env.development',
      // глоб.видим.
      isGlobal: true,
    }),
    // подкл.к БД Supabase всегда
    ...(isProduction || isTotal
      ? [
          TypeOrmModule.forRootAsync({
            name: 'supabase',
            useFactory: supabaseConfig,
          }),
        ]
      : []),
    // ^ доп.подкл.к локал.БД > разработки (dev БД SB, total БД SB, LH)
    ...(isDevelopment || isTotal
      ? [
          TypeOrmModule.forRootAsync({
            name: 'localhost',
            useFactory: localhostConfig,
          }),
        ]
      : []),
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
  providers: [AppService, WinstonLoggerProvider],
  exports: [WinstonLoggerProvider],
})
export class AppModule {}
