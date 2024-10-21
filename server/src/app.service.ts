// общ.сервис приложения (бизн.лог.данн:мтд.получ.,обраб.,возврат)
import { Injectable } from '@nestjs/common';

// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from './config/envs/env.consts.js';

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
    let mod: string, db: string, srv: string;
    if (isProduction) {
      mod = 'PROD';
      db = process.env.DB_SB_PORT;
      srv = process.env.SRV_VL_URL;
    } else if (isDevelopment) {
      mod = 'DEV';
      db = process.env.LH_DB_PORT;
      srv = process.env.LH_SRV_URL + process.env.LH_SRV_PORT;
    } else if (isTotal) {
      mod = 'DEV + PROD';
      db = process.env.LH_DB_PORT;
      srv = process.env.LH_SRV_URL + process.env.LH_SRV_PORT;
    }
    console.log(`${mod}.a.serv.  SRV: '${srv}  DB: ${db}`);
    return `${mod}.a.serv.  SRV: '${srv}  DB: ${db}`;
  }
}
