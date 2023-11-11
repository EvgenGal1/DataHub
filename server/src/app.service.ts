import { Injectable } from '@nestjs/common';

// Ввод Provider в др.кл.ч/з `@Инъекции`
@Injectable()
export class AppService {
  getUsers(): string {
    return 'get All Users';
  }

  getUsers2(): string {
    return 'get All Users 2';
  }
}
