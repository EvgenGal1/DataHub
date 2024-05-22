// общ.контроллер приложения (обраб.маршр.,req|res CRUD, взаимодейств.>тип,тело,парам.req|res)
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

// декор.контроллер(маршр.req). (обраб.маршр.req|res CRUD)
@Controller('/')
export class AppController {
  constructor(
    // внедр.завис.(подкл.внешн.комп.в данный)
    private readonly appService: AppService,
  ) {}

  // декоратор.маршр.req
  @Get()
  // мтд.получ.данн.
  getUsers(): string {
    // после внедр.завис. обращ.к serv ч/з this
    return this.appService.getUsers();
  }
}

// альтер.декор.маршр.req
@Controller('/api')
export class AppController2 {
  constructor(private readonly appService: AppService) {}

  @Get(/*    */)
  getUsers2(): string {
    return this.appService.getUsers2();
  }
}
