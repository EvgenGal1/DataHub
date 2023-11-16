import { Injectable } from '@nestjs/common';

// Ввод Provider в др.кл.ч/з `@Инъекции`
@Injectable()
export class AppService {
  getUsers(): string {
    return 'Главная Страница';
  }

  getUsers2(): string {
    return 'Страгица /Api';
  }
}
