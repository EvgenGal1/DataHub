import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    // PORT Запуска
    const PORT = process.env.PORT || 5000;
    // modul входа
    const app = await NestFactory.create(AppModule /* , { cors: false } */);
    // в 2х местах откл. cors
    // app.enableCors({ credentials: true, origin: true });

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
        // настр.для использ.jwt.Токен в swagger
        persisAuthorization: true,
      },
    });

    // прослуш.PORT и fn()callback с cg на Запуск
    await app.listen(PORT, () => console.log(`Запуск Сервер > PORT ${PORT}`));
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
// 123
