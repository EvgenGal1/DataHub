import { Module, MiddlewareConsumer } from '@nestjs/common';
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
import { isProduction } from './config/envs/env.consts.js';

// декор.модуль. (организ.структуры области действ.> cntrl и provider)
@Module({
  imports: [
    // подкл.конфиг.модуль > счит.перем.из.env
    ConfigModule.forRoot({
      // условн.путь к ф.конфиг.
      envFilePath:
        // ['.env.development', '.env.production'],
        isProduction
          ? `.env.${process.env.NODE_ENV}`
          : `.env.${process.env.NODE_ENV}`,
      // глоб.видим.
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      name: isProduction ? 'supabase' : 'localhost',
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
  // подкл.cnrtl данного модуля
  controllers: [AppController],
  // подкл.serv данного модуля
  providers: [AppService, LoggingWinston],
  exports: [LoggingWinston],
})
export class AppModule {
  // ^ замена ServeStaticModule от ошб. при сборке VERCEL от -v @nestjs/(serve-static, common)
  // configure(consumer: MiddlewareConsumer) { consumer.apply(express.static(path.join(__dirname, '..', 'public'))).forRoutes('*'); }
}
