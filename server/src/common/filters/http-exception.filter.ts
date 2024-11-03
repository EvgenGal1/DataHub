// ^ глобал.фильтр исключ. > обраб.ошб.HTTP/исключ. и возвращ. статус,время,url,msg

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// объ.сопоставления КОД - СМС
const statusMessages: { [key: number]: string } = {
  [HttpStatus.BAD_REQUEST]: 'Некорректные данные',
  [HttpStatus.UNAUTHORIZED]: 'Доступ к ресурсу запрещён',
  [HttpStatus.FORBIDDEN]: 'У вас нет прав для доступа к этому ресурсу',
  [HttpStatus.NOT_FOUND]: 'Ресурс не найден',
  [HttpStatus.NOT_ACCEPTABLE]:
    'Запрос не может быть обработан, так как формат данных неприемлем',
  [HttpStatus.CONFLICT]: 'Конфликт данных',
  [HttpStatus.GONE]: 'Запрашиваемый ресурс больше не доступен',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Внутренняя ошибка сервера',
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      statusMessages[status] || exception.message || 'Неизвестная ошибка';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception instanceof HttpException ? exception.message : message,
      ...(exception instanceof HttpException &&
        exception.getResponse && { error: exception.getResponse() }),
    };

    this.logger.error(
      `ОШБ.: Статус ${status} на ${request.url}: ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
