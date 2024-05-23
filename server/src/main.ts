// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<any> {
  try {
    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа и пр.настр.
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
    });
    // PORT Запуска
    // const PORT = process.env.PORT || 5000;
    let PORT: number;
    // if (process.env.NODE_ENV === 'production') {
    //   PORT = +process.env.SB_PG_PORT;
    // } else if (process.env.NODE_ENV === 'development') {
    //   PORT = +process.env.PORT;
    // }
    if (process.env.NODE_ENV === 'development') {
      PORT = +process.env.PORT;
    } else if (process.env.NODE_ENV === 'production') {
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

    if (process.env.NODE_ENV === 'development') {
      config.addServer(`${process.env.PROTOCOL}${PORT}`);
    } else if (process.env.NODE_ENV === 'production') {
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
    return await app.listen(PORT, () => {
      // console.log(`Запуск Сервер > PORT ${PORT}`);
      let srt: string, port: string, url: string, source: string;
      if (process.env.NODE_ENV === 'development') {
        srt = 'DEV';
        source = 'localhost';
        port = `${process.env.LH_PG_PORT}(${source})`;
        url = process.env.PROTOCOL + process.env.PORT;
      } else if (process.env.NODE_ENV === 'production') {
        srt = 'PROD';
        port = process.env.SB_PG_PORT + '(SUPABASE)';
        source = 'VERCEL';
        url = process.env.VERCEL_URL;
      }
      console.log(`${srt}. Сервер - ${port}, подключён '${source}' - ${url}`);
    });
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
