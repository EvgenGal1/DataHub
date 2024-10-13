import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
// import { ServeStaticModule } from '@nestjs/serve-static';
import * as express from 'express';
import * as path from 'path';

import { AppController, AppController2 } from './app.controller.js';
import { AppService } from './app.service.js';
// import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { FilesModule } from './modules/files/files.module.js';
import { TrackModule } from './modules/tracks/tracks.module.js';
import { AlbumModule } from './modules/albums/albums.module.js';
import { ReactionsModule } from './modules/reactions/reactions.module.js';
// БД. config
import { localhostConfig } from './config/localhost.config.js';
import { supabaseConfig } from './config/supabase.config.js';
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
    // ! ошб. при сборке VERCEL от -v @nestjs/(serve-static, common). ~ замена ниже в export
    // ServeStaticModule.forRoot({
    //   rootPath: `${__dirname}/../static`,
    //   serveRoot: '/static',
    // }),
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
export class AppModule {
  // ^ замена ServeStaticModule от ошб. при сборке VERCEL от -v @nestjs/(serve-static, common)
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.static(path.join(__dirname, '..', 'static')))
      .forRoutes('*'); // Можно ограничить маршруты, если нужно
  }
}
