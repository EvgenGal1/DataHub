// общ.сервис приложения (бизн.лог.данн:мтд.получ.,обраб.,возврат)
import { Injectable } from '@nestjs/common';

// константы > команды запуска process.env.NODE_ENV
import { isProduction, isDevelopment } from './config/envs/env.consts.js';

// декор.`инъекции`. (отметка кл.как Provider ч/з инъекции > подкл.в др.кл.)
@Injectable()
export class AppService {
  // ч/з внедр.завис. + ConfigService > раб.ч/з this
  // constructor(private readonly configService: ConfigService) {}

  // мтд.обраб.данн.
  getHello(): string {
    return 'Главная Страница';
  }

  getDetails(): string {
    let mod: string,
      db: string = process.env.DB_PORT,
      srv: string = process.env.SRV_URL;
    if (isProduction) mod = 'PROD';
    else if (isDevelopment) mod = 'DEV';

    console.log(`${mod}.a.serv.  SRV: '${srv}  DB: ${db}`);
    return `${mod}.a.serv.  SRV: '${srv}  DB: ${db}`;
  }
}
