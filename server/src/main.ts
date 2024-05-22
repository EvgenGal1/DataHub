// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<any> {
  try {
    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа и пр.настр.
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // PORT Запуска
    const PORT = process.env.PORT || 5000;

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

    // настр.док.swagger(swg)
    const config = new DocumentBuilder()
      .setTitle('Музыкальная Платформа')
      .setDescription('Описание API Музыкальной платформы')
      .setVersion('1.0')
      // настр.для использ.jwt.Токен в swagger
      .addBearerAuth();

    if (process.env.NODE_ENV === 'production') {
      config.addServer(process.env.VERCEL_URL);
    } else if (process.env.NODE_ENV === 'development') {
      config.addServer(`${process.env.PROTOCOL}${PORT}`);
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
    return await app.listen(PORT, () => {
      console.log(`Запуск Сервер > PORT ${PORT}`);
    });
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
