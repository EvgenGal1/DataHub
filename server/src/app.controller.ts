// общ.контроллер приложения (обраб.маршр.,req|res CRUD, взаимодейств.>тип,тело,парам.req|res)
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

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

  @Get('/api/auth/get')
  getHello(): string | number {
    return this.appService.getHello();
  }
}

// альтер.декор.маршр.req
@Controller('/api')
export class AppController2 {
  constructor(private readonly appService: AppService) {}

  @Get(/*    */)
  getUsers(): string {
    return this.appService.getUsers2();
  }
}
