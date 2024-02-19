// общ.сервис приложения (бизн.лог.данн:мтд.получ.,обраб.,возврат)
import { Injectable } from '@nestjs/common';

// декор.`инъекции`. (отметка кл.как Provider ч/з инъекции > подкл.в др.кл.)
@Injectable()
export class AppService {
  // мтд.обраб.данн.
  getUsers(): string {
    return 'Главная Страница';
  }

  getUsers2(): string {
    return 'Страница по Api';
  }
}
