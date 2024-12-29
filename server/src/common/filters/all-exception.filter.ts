// ^ глобал.фильтр исключ. > перехвата/обраб.ошб.HTTP/исключ. и возвращ. статус,время,url,мтд,msg

import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { isDevelopment } from '../../config/envs/env.consts';

// объ.сопоставления КОД - СМС
const statusMessages: { [key: number]: string } = {
  [HttpStatus.NOT_FOUND]: 'Ресурс не найден',
  [HttpStatus.BAD_REQUEST]: 'Ошибка запроса, некорректные данные',
  [HttpStatus.UNAUTHORIZED]: 'Доступ к ресурсу запрещён',
  [HttpStatus.FORBIDDEN]: 'У вас нет прав для доступа',
  [HttpStatus.NOT_ACCEPTABLE]: 'Запрос не обработан, формат данных неприемлем',
  [HttpStatus.CONFLICT]: 'Конфликт данных',
  [HttpStatus.GONE]: 'Запрашиваемый ресурс больше не доступен',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Внутренняя ошибка сервера',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // мтд.обраб.исключ.
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // состав.статус
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Получаем сообщение об ошибке
    const message = this.getErrorMessage(exception, status);

    // объ.ошб.res
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest<Request>().url,
      method: ctx.getRequest<Request>().method,
      message,
      error: isDevelopment
        ? exception instanceof Error
          ? statusMessages[status]
          : 'Неизвестная ошибка'
        : null,
    };

    this.logger.error(
      `ОШБ.: Статус ${status} на ${request.url}: ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }

  // мтд.получ.смс об ошб.
  private getErrorMessage(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'object' && response['message']
        ? response['message']
        : statusMessages[status] || 'Неизвестная ошибка';
    }
    // общ.ошб.
    else if (exception instanceof Error) {
      // специф.ошб.БД
      if ((exception as any).code === '23505') {
        return 'Дублирование уникального значения.';
      }
      // Возвращаем стандартное сообщение ошибки
      return (
        exception.message || statusMessages[status] || 'Неизвестная ошибка'
      );
    }
    // неизвестные исключения
    else {
      return statusMessages[status] || 'Неизвестная ошибка';
    }
  }
}
