// общ.контроллер приложения
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// декор.контроллера(маршр.req)
@Controller('/')
export class AppController {
  constructor(
    // внедр.завис.(подкл.внешн.комп.в данный)
    private readonly appService: AppService,
  ) {}

  // декоратор.получ.данн.
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

  @Get()
  getUsers(): string {
    return this.appService.getUsers2();
  }
}
