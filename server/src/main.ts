// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isDocker,
} from './config/envs/env.consts.js';
// загр.перем.окруж.от кмд.NODE_ENV до подкл.др.модулей (+Docker)
config({
  path: `${isDocker ? '../' : ''}.env.${isDocker ? process.env.NODE_ENV_DOCK : process.env.NODE_ENV}`,
});

import { AppModule } from './app.module.js';
// фильтр исключ.
import { AllExceptionsFilter } from './common/filters/all-exception.filter.js';
// логирование LH Winston
import { LoggingWinston } from './config/logging/log_winston.config.js';
// документирование Swagger
import { DocumentSwagger } from './config/documents/swagger.config.js';

async function bootstrap(): Promise<any> {
  try {
    // PORT Запуска SRV
    const PORT: number = +process.env.SRV_PORT || 5000;

    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа и пр.настр.
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
    });

    // в 2х местах вкл. cors
    app.enableCors({ credentials: true, origin: true });

    // п.статич.ф.
    app.useStaticAssets(path.join(__dirname, '..', 'public'), {
      prefix: '/public/',
    });

    // обраб.валидации ч/з глобал.обраб.исключений
    app.useGlobalPipes(new ValidationPipe());

    // обраб.ошб.ч/з глобал.обраб.исключений
    app.useGlobalFilters(new AllExceptionsFilter());

    // логгирование (Winston)
    let logger: LoggingWinston;
    if (isProduction) app.useLogger(new ConsoleLogger());
    else if (isDevelopment) {
      logger = app.get(LoggingWinston);
      app.useLogger(logger);
      // созд.п. > логи
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const logDir = path.join(tmpDir, 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    }

    // документирование (Swagger)
    DocumentSwagger(app);

    // прослуш.PORT и fn()callback с log на Запуск
    await app.listen(PORT, () => {
      // цвета запуска: DEV - зелённый, PROD - синий
      const mainColor = isDevelopment ? '\x1b[32m' : '\x1b[34m';
      // вывод с цветом подкл.к БД от NODE_ENV. PROD(SB) <> DEV(LH)
      console.log(
        `\x1b[41m${process.env.NODE_ENV.toUpperCase()}\x1b[0m   MAIN   SRV: ${mainColor}${process.env.SRV_URL}\x1b[0m   DB: \x1b[33m${process.env.DB_NAME}:${process.env.DB_PORT}\x1b[0m`,
      );
    });
    if (logger && isDevelopment)
      logger.info(
        `DEV   MAIN   SRV: ${process.env.SRV_URL}   DB: ${process.env.DB_NAME}:${process.env.DB_PORT}`,
      );
  } catch (error) {
    if (isDevelopment) {
      const logger = new LoggingWinston();
      logger.error(`DEV   MAIN.error '${error}'`);
    }
    console.log('m.err : ', error);
  }
}

bootstrap();
// // bootstrap() при прямом запуске > изоляции сервера при тестах
// if (require.main === module) bootstrap();
// // экспорт приложения > тестов
// export default bootstrap;
