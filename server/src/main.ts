// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
// import * as SwaggerUIStandalonePreset from 'swagger-ui-standalone-preset';
// import SwaggerUI from 'swagger-ui-dist/swagger-ui.min.js';
// import 'swagger-ui-dist/swagger-ui.css';
// import swaggerUI from "swagger-ui-express";
// import swaggerJsDoc from "swagger-jsdoc";
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConsoleLogger } from '@nestjs/common';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { AppModule } from './app.module.js';
// фильтр исключ.
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
// логирование LH Winston
import { LoggingWinston } from './config/logging/log_winston.config.js';
// документирование Swagger
import { DocumentSwagger } from './config/documents/doc_swagger.config.js';
// константы > команды запуска process.env.NODE_ENV
import { isProduction, isDevelopment } from './config/envs/env.consts.js';

// загр.перем.окруж.от кмд.NODE_ENV
if (isDevelopment) config({ path: '.env.development' });
else if (isProduction) config({ path: '.env.production' });

async function bootstrap(): Promise<any> {
  try {
    // PORT Запуска SRV
    const PORT: number = isProduction
      ? +process.env.DB_SB_PORT || 3000
      : +process.env.LH_SRV_PORT || 3000;

    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа и пр.настр.
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
    });

    // п.статич.ф.
    app.useStaticAssets(path.join(__dirname, '..', 'public'), {
      prefix: '/public/',
    });

    // обраб.ошб.ч/з глобал.обраб.исключений
    app.useGlobalFilters(new HttpExceptionFilter());

    // логгирование (Winston)
    let logger;
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
      // вывод подкл.к БД от NODE_ENV. PROD(SB) <> DEV(LH)
      console.log(
        `${isProduction ? 'PROD' : 'DEV'}.m.  SRV: ${isProduction ? process.env.SRV_VL_URL : `${process.env.LH_SRV_URL}${process.env.LH_SRV_PORT}`}  DB: ${isProduction ? process.env.DB_SB_URL : `${process.env.LH_DB_NAME}:${process.env.LH_DB_PORT}`}`,
      );
    });
    if (logger && isDevelopment)
      logger.info(
        `DEV.m.  SRV: ${process.env.LH_SRV_URL}${process.env.LH_SRV_PORT}  DB: ${process.env.LH_DB_NAME}:${process.env.LH_DB_PORT}`,
      );
  } catch (e) {
    console.log('m.err : ' + e);
  }
}

bootstrap();
