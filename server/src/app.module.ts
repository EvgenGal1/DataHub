import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { FilesModule } from './modules/files/files.module.js';
import { TrackModule } from './modules/tracks/tracks.module.js';
import { AlbumModule } from './modules/albums/albums.module.js';
import { ReactionsModule } from './modules/reactions/reactions.module.js';
// БД. config
import { DBLocalhostConfig } from './config/database/db_localhost.config.js';
import { DBSupabaseConfig } from './config/database/db_supabase.config.js';
// логгирование LH
import { LoggingWinston } from './config/logging/log_winston.config.js';
// константы > команды запуска process.env.NODE_ENV
import { isProduction, isDocker } from './config/envs/env.consts.js';

// декор.модуль. (организ.структуры области действ.> cntrl и provider)
@Module({
  // подкл.использ.модули
  imports: [
    // подкл.конфиг.модуль > счит.перем.из.env
    ConfigModule.forRoot({
      // условн.путь к ф.конфиг.
      envFilePath: isProduction
        ? `.env.${process.env.NODE_ENV}`
        : isDocker
          ? `../.env.${process.env.NODE_ENV_DOCK}`
          : `.env.${process.env.NODE_ENV}`,
      // глоб.видим.
      isGlobal: true,
    }),
    // асинхр.подкл.БД
    TypeOrmModule.forRootAsync({
      name: process.env.DB_NAM,
      useFactory: isProduction ? DBSupabaseConfig : DBLocalhostConfig,
    }),
    // обслуж.статич.контент по путь/папка ч/з веб-сайт
    // ! ошб. при сборке VERCEL от -v @nestjs/(serve-static, common). ~ замена ниже в export
    // ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public '), /* serveRoot: '/static', */ }),
    // подкл.использ.modulи
    AuthModule,
    UsersModule,
    RolesModule,
    FilesModule,
    TrackModule,
    AlbumModule,
    ReactionsModule,
  ],
  // подкл.cnrtl/обраб.req в данн.модуль
  controllers: [AppController],
  // подкл.serv/cls/log/strateg/util в данн.модуль
  providers: [AppService, LoggingWinston],
  // доступ в др.модули
  exports: [LoggingWinston],
})
export class AppModule {}
