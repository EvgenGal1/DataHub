// общ.контроллер приложения (обраб.маршр.,req|res CRUD, взаимодейств.>тип,тело,парам.req|res)
import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

// константы > команды запуска process.env.NODE_ENV
import { isProduction } from './config/envs/env.consts.js';

// групп.мтд.cntrl app
@ApiTags('app')
// декор.контроллер(маршр.req). (обраб.маршр.req|res CRUD)
@Controller('/')
export class AppController {
  constructor(
    // внедр.завис.(подкл.внешн.комп.в данный)
    private readonly appService: AppService,
  ) {}

  // декоратор.маршр.req
  @Get('/')
  // декор.ответа
  getHello(@Res() res: Response): void {
    // после внедр.завис. обращ.к serv ч/з this
    // return this.appService.getHello();
    const viewPath = isProduction
      ? `${process.env.SRV_VL_URL}/public/views/pages/welcome.html`
      : // : `${process.env.LH_SRV_URL}${process.env.LH_SRV_PORT}/views/pages/welcome.html`;
        `/views/pages/welcome.html`;
    // возвращ.ф.HTML по пути из раб.п.
    // res.sendFile('/public/views/pages/welcome.html', { root: __dirname });
    res.sendFile(viewPath, { root: 'public' });
  }

  @Get('/details')
  getDetails(): string {
    // return this.appService.getDetails();
    const connectionDetails = `${isProduction ? 'PROD' : 'DEV'}.a.c.  SRV: ${isProduction ? process.env.SRV_VL_URL : `${process.env.LH_SRV_URL}${process.env.LH_SRV_PORT}`}  DB: ${isProduction ? process.env.DB_SB_URL : `${process.env.LH_DB_NAME}:${process.env.LH_DB_PORT}`}`;
    console.log(connectionDetails);
    return connectionDetails;
  }
}
