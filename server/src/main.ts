// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from './config/envs/env.consts.js';
// http фильтер исклюяений
import { HttpExceptionFilter } from './http-exception.filter.js';

async function bootstrap(): Promise<any> {
  try {
    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа и пр.настр.
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
    });

    // логи
    const logger = app.get('WINSTON_LOGGER');
    app.useLogger(logger);

    // обраб.ошб.ч/з глобал.обраб.исключений
    app.useGlobalFilters(new HttpExceptionFilter());

    // PORT Запуска
    // const PORT = process.env.PORT || 5000;
    let PORT: number;
    if (isDevelopment || isTotal) {
      PORT = +process.env.PORT;
    } else if (isProduction) {
      PORT = +process.env.SB_PG_PORT;
    }

    // настр.док.swagger(swg)
    // const configSwagger = new DocumentBuilder()
    const config = new DocumentBuilder()
      .setTitle('Музыкальная Платформа')
      .setDescription('Описание API Музыкальной платформы')
      .setVersion('1.0')
      // настр.для использ.jwt.Токен в swagger
      .addBearerAuth();
    // Указ.URL Своёго сервера (localhost | VERCEL)
    // .addServer(`${process.env.PROTOCOL}${PORT}`)
    // .addServer(`${process.env.VERCEL_URL}`)
    // .addTag('app') .build();
    if (isDevelopment || isTotal) {
      config.addServer(`${process.env.PROTOCOL}${PORT}`);
    } else if (isProduction) {
      config.addServer(process.env.VERCEL_URL);
    }
    const configSwagger = config.build();

    // созд.док.swg(экземп.прилож., объ.парам., специф.доступа(3ий не обязат.парам.))
    const document = SwaggerModule.createDocument(app, configSwagger);
    // настр.путей swg(путь устан.swg, экземп.прилож., объ.док.)
    SwaggerModule.setup('swagger', app, document, {
      // Название страницы Swagger
      customSiteTitle: 'Музыкальная Платформа (swg)',
      swaggerOptions: {
        // `постоянное разрешение`настр.для использ.jwt.Токен в swagger
        persistAuthorization: true,
      },
    });

    // прослуш.PORT и fn()callback с cg на Запуск
    /* return */ await app.listen(PORT, () => {
      // console.log(`Запуск Сервер > PORT ${PORT}`);
      // ^ вывод подкл.к БД от NODE_ENV. производство(БД SB) <> разработка (dev БД SB, total БД SB, LH)
      let srt: string, port: string, url: string, source: string;
      if (isDevelopment) {
        srt = 'DEV';
        source = 'LocalHost';
        port = `${process.env.LH_PG_PORT}(${source})`;
        url = process.env.PROTOCOL + process.env.PORT;
      } else if (isTotal) {
        srt = 'DEV + PROD';
        source = 'LocalHost++';
        port = `${process.env.LH_PG_PORT}(${source})`;
        source = 'LocalHost + SupaBase';
        url = process.env.PROTOCOL + process.env.PORT;
      } else if (isProduction) {
        srt = 'PROD';
        port = process.env.SB_PG_PORT + '(SupaBase)';
        source = 'VERCEL';
        url = process.env.VERCEL_URL;
      }
      console.log(`${srt}. Сервер - ${port}, подключён '${source}' - ${url}`);
    });
    logger.info(`Приложение работает на: ${await app.getUrl()}`);
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
