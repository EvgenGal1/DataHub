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
    // const viewPath = isProduction
    //   ? `/views/pages/welcome.html`
    //   : `/views/pages/welcome.html`;
    // возвращ.ф.HTML по пути из раб.п.
    // res.sendFile('/public/views/pages/welcome.html', { root: __dirname });
    // res.sendFile(viewPath, { root: 'public' });
    const htmlContent = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html" />
        <meta httpEquiv="cache-control" content="personal website" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1,maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" type="image/png" href="./public/favicon.ico" />
        <title>Data Hub (API)</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            text-align: center;
            background-color: #442d25;
            font-family: Arial, sans-serif;
          }
          .container {
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 600px;
            margin: 0 auto;
            padding: 5px;
            color: #c2c2c2;
            border-radius: 5px;
            background-color: #252850;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          h1,
          h2,
          p {
            color: #111;
          }

          .container-link {
            padding: 10px;
          }

          .container-link:hover {
            text-decoration: overline underline;
          }

          .container-link > a {
            display: block;
            margin: 10px 0;
            color: #c2c2c2;
            font-size: larger;
            text-decoration: underline;
          }

          .details-output {
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Добро пожаловать в Data Hub!</h1>
        <h2>API приложения Data Hub | Центр Данных</h2>
        <p>Основная точка входа API. Ниже приведены некоторые полезные ссылки:</p>
        <div class="container">
          <div class="container-link">
            <a href="/doc-swg" target="_blank">API Docs Swagger</a>
          </div>
          <div class="container-link">
            <a href="#" id="get-details-btn">Данные подключения</a>
          </div>
        </div>
        <div style="margin: 1rem 0px"><p id="details-output"></p></div>
      </body>
      <script>
        let dataVisible = false;
        let timeoutId = null;

        document
          .getElementById('get-details-btn')
          .addEventListener('click', function () {
            fetch('/details')
              .then((response) => response.text())
              .then((data) => {
                if (!dataVisible) {
                  document.getElementById('details-output').innerText = data;
                  dataVisible = true;
                  // таймер 10 сек.
                  timeoutId = setTimeout(() => {
                    document.getElementById('details-output').innerText = '';
                    dataVisible = false;
                  }, 10000);
                } else {
                  // видны - скрываем
                  document.getElementById('details-output').innerText = '';
                  dataVisible = false;
                  // очистка таймера
                  clearTimeout(timeoutId);
                }
              })
              .catch((error) => {
                console.error('Ошибка welcome: ', error);
              });
          });
      </script>
    </html>
    `;
    res.send(htmlContent);
  }

  @Get('/details')
  getDetails(): string {
    // return this.appService.getDetails();
    const connectionDetails = `${isProduction ? 'PROD' : 'DEV'}.a.c.  SRV: ${isProduction ? process.env.SRV_VL_URL : `${process.env.LH_SRV_URL}${process.env.LH_SRV_PORT}`}  DB: ${isProduction ? process.env.DB_SB_URL : `${process.env.LH_DB_NAME}:${process.env.LH_DB_PORT}`}`;
    console.log(connectionDetails);
    return connectionDetails;
  }
}
