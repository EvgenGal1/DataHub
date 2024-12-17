// ^ документация Swagger

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

export const DocumentSwagger = (app: NestExpressApplication) => {
  // настр.док.swg
  const configSwagger = new DocumentBuilder()
    .setTitle('Data Hub | Центр Данных')
    .setDescription('Описание методов интеграции API')
    .setVersion('1.1.0')
    .addTag('app')
    // JWT токен аутентификации
    .addBearerAuth()
    // URL сервера
    .addServer(process.env.SRV_URL)
    .build();
  // созд.док.swg
  const document = SwaggerModule.createDocument(app, configSwagger);
  // настр.маршрута swg
  SwaggerModule.setup('swagger', app, document, {
    // Название страницы Swagger
    customSiteTitle: 'Data Hub (Swagger)',
    swaggerOptions: {
      // `постоянное разрешение` на использ.JWT Токен в swg
      persistAuthorization: true,
    },
    // кастом иконки в браузере
    customfavIcon: `${process.env.SRV_URL}/public/img/ico/icon.ico`,
    // кастом ф.JS (для отраб.статич.ф.на PROD - Vercel)
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    // кастом ф.CSS
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css', // для отраб.статич.ф.на PROD - Vercel
      `${process.env.SRV_URL}/public/swagger/theme.css`, // темы + своё
    ],
  });
};
