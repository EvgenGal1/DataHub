// общ.сервис приложения (бизн.лог.данн:мтд.получ.,обраб.,возврат)
import { Injectable } from '@nestjs/common';

// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from './common/envs/env.consts.js';

// декор.`инъекции`. (отметка кл.как Provider ч/з инъекции > подкл.в др.кл.)
@Injectable()
export class AppService {
  // ч/з внедр.завис. + ConfigService > раб.ч/з this
  // constructor(private readonly configService: ConfigService) {}

  // мтд.обраб.данн.
  getUsers(): string {
    return 'Главная Страница';
  }

  getUsers2(): string {
    return 'Страница по Api';
  }

  getHello(): string {
    let srt: string, port: string, url: string, source: string;
    if (isProduction) {
      srt = 'PROD';
      port = process.env.SB_PG_PORT + '(SUPABASE)';
      source = 'VERCEL';
      url = process.env.VERCEL_URL;
    } else if (isTotal) {
      srt = 'DEV + PROD';
      source = 'LocalHost++';
      port = `${process.env.LH_PG_PORT}(${source})`;
      source = 'LocalHost + SupaBase';
      url = process.env.PROTOCOL + process.env.PORT;
    } else if (isDevelopment) {
      srt = 'DEV';
      source = 'localhost';
      port = `${process.env.LH_PG_PORT}(${source})`;
      url = process.env.PROTOCOL + process.env.PORT;
    }
    return `${srt}. Сервер - ${port}, подключён '${source}' - ${url}`;
  }
}
