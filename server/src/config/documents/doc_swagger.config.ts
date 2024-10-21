// ^ документация Swagger

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { isProduction } from '../envs/env.consts.js';

export const DocumentSwagger = (app: NestExpressApplication) => {
  // настр.док.swg
  const configSwagger = new DocumentBuilder()
    .setTitle('Data Hub | Центр Данных')
    .setDescription('Описание методов интеграции API')
    .setVersion('1.1')
    .addTag('app')
    // токен аутентификации
    // .addBearerAuth()
    // Указание URL вашего сервера
    .addServer(
      isProduction
        ? `${process.env.SRV_VL_URL}`
        : `${process.env.LH_SRV_URL}${process.env.LH_SRV_PORT}`,
    )
    .build();
  // созд.док.swg
  const document = SwaggerModule.createDocument(app, configSwagger);
  // настр.маршрута swg
  SwaggerModule.setup('doc-swg', app, document, {
    // Название страницы Swagger
    customSiteTitle: 'Data Hub (Swagger)',
    swaggerOptions: {
      // `постоянное разрешение`настр.для использ.jwt.Токен в swg
      persistAuthorization: true,
    },
    // кастом иконки в браузере
    customfavIcon: isProduction
      ? `${process.env.SRV_VL_URL}/public/img/ico/icon.ico`
      : `${process.env.LH_SRV_URL}${process.env.LH_SRV_PORT}/public/img/ico/icon.ico`,
    // кастом ф.JS (для отраб.статич.ф.на PROD - Vercel)
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    // кастом ф.CSS (для отраб.статич.ф.на PROD - Vercel)
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });
};
