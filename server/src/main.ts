// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import * as cors from 'cors';
// import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    // PORT Запуска
    const PORT = process.env.PORT || 5000;
    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа
    const app = await NestFactory.create(AppModule /* , { cors: false } */);

    // CORS настр. > отправ./блок.req браузера
    app.enableCors({
      // разреш.любой источник
      origin: true,
      // разреш.мтд.HTTP
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      // разреш.заголовки
      allowedHeaders: [
        'Content-Type',
        'Origin',
        'X-Requested-With',
        'Accept',
        'Authorization',
      ],
      // заголовки, доступные клиенту
      exposedHeaders: ['Authorization'],
      // вкл.учёт.данн.(куки, заголовки авторизации) из разн.источников
      credentials: true,
    });

    // Вкл.глобал.фильтры и валид.данн.
    // app.useGlobalFilters(new AllExceptionsFilter());
    // app.useGlobalPipes(new ValidationPipe());

    // MW для путей файлов в static - перенос в AppModule
    // app.use('/static', express.static(join(__dirname, '..', 'static')));

    // MW для ошб.
    // app.use((err, req, res, next) => {
    //   // Проверяем, является ли ошибка нашей ожидаемой ошибкой от multer.diskStorage
    //   if (err.code === 'EXPECTED_ERROR_CODE') {
    //     // Возвращаем ошибку в формате, подходящем для Swagger
    //     return res.status(400).json({ error: 'Описание ошибки для Swagger' });
    //   }
    //   // Если это не ошибка от multer.diskStorage, передаем управление дальше
    //   next(err);
    // });

    // ! не раб. - по url vercel (https://music-platform-serv-nest.vercel.app/swagger) ошб. - Uncaught ReferenceError: SwaggerUIBundle is not defined at window.onload (swagger-ui-init.js:71:7)
    // настр.док.swagger(swg)
    const config = new DocumentBuilder()
      .setTitle('Музыкальная Платформа')
      .setDescription('Описание API Музыкальной платформы')
      .setVersion('1.0')
      // настр.для использ.jwt.Токен в swagger
      // .addBearerAuth()
      // Указ.URL Своёго сервера
      // localhost
      // .addServer(`${process.env.PROTOCOL}${PORT}`)
      // VERCEL
      .addServer(`${process.env.VERCEL_URL}`)
      // .addTag('app')
      .build();
    // созд.док.swg(экземп.прилож., объ.парам., специф.доступа(3ий не обязат.парам.))
    const document = SwaggerModule.createDocument(app, config);
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
    await app.listen(PORT, () => console.log(`Запуск Сервер > PORT ${PORT}`));
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
