// точка входа, запуск приложения
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
async function bootstrap(): Promise<any> {
  try {
    // в перем.app асинхр.созд.экзепл.приложения ч/з кл.NestFactory с передачей в парам.modul входа и пр.настр.
    const app = await NestFactory.create(AppModule, {
      cors: true,
    });
    // PORT Запуска
    const PORT = process.env.PORT || 5000;

    // прослуш.PORT и fn()callback с cg на Запуск
    return await app.listen(PORT, () => {
      console.log(`Запуск Сервер > PORT ${PORT}`);
    });
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
