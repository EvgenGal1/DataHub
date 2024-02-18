// общ.сервис приложения
import { Injectable } from '@nestjs/common';

// декор.`@Инъекции` отметка кл.как Provider
@Injectable()
export class AppService {
  getUsers(): string {
    return 'Главная Страница';
  }

  getUsers2(): string {
    return 'Страница по Api';
  }
}
