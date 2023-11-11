import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    // PORT Запуска
    const PORT = process.env.PORT || 5791;
    // modul входа
    const app = await NestFactory.create(AppModule);

    // прослуш.PORT и fn()callback с cg на Запуск
    await app.listen(PORT, () => console.log(`Запуск Сервер > PORT ${PORT}`));
  } catch (e) {
    console.log('main e : ' + e);
  }
}
bootstrap();
// 123
