// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';
// import { ValidationPipe } from '@nestjs/common';
// import * as express from 'express';
// import { join } from 'path';

async function bootstrap() {
  try {
    // PORT Запуска
    const PORT = process.env.PORT || 5000;
    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа
    const app = await NestFactory.create(AppModule /* , { cors: false } */);
    // в 2х местах откл. cors
    // app.enableCors(/* { credentials: true, origin: true } */);

    // 1. Включаем глобальные фильтры и валидацию данных
    // app.useGlobalFilters(new AllExceptionsFilter());
    // app.useGlobalPipes(new ValidationPipe());

    // 2. Включаем CORS с настройками
    app.use(
      cors({
        // origin: '*', // Измените на нужный URL вашего фронтенда
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    // MW для путей файлов в uploads
    // app.use('/static', express.static(join(__dirname, '..', 'uploads')));

    // настр.док.swagger(swg)
    const config = new DocumentBuilder()
      .setTitle('Музыкальная Платформа')
      .setDescription('Описание API Музыкальной платформы')
      .setVersion('1.0') // настр.для использ.jwt.Токен в swagger
      .addBearerAuth()
      .addServer(`http://localhost:${PORT}`) // Указ.URL Своёго сервера
      // .addTag('app')
      .build();
    // созд.док.swg(экземп.прилож., объ.парам., специф.доступа(3ий не обязат.парам.))
    const document = SwaggerModule.createDocument(app, config);
    // настр.путей swg. Путь устан.swg, Экземп.прилож., Объ.док.
    SwaggerModule.setup('swagger', app, document, {
      customSiteTitle: 'Музыкальная Платформа', // Название страницы Swagger
      swaggerOptions: {
        // `постоянное разрешение`настр.для использ.jwt.Токен в swagger
        persistAuthorization: true,
      },
    });

    // прослуш.PORT и fn()callback с cg на Запуск
    await app.listen(PORT, () => console.log(`Запуск Сервер > PORT ${PORT}`));
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
