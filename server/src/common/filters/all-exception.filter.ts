// ^ глобал.фильтр исключ. > обраб.ошб.HTTP/исключ. и возвращ. статус,время,url,msg

import {
  Catch,
  ExceptionFilter,
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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    // обраб.общ.ошб.
    if (exception instanceof HttpException) {
      const exceptionResponse: any = exception.getResponse();
      const exceptionMessage = Array.isArray(exceptionResponse?.message)
        ? exceptionResponse.message.join(', ')
        : exceptionResponse?.message || null;
      message =
        // exceptionMessage || statusMessages[status] || 'Неизвестная ошибка'; // ^ ответ: exception.message <> statusMessages.status <> unknown
        exceptionMessage // ^ ответ: склейка statusMessages.status с exception.message <> unknown
          ? `${statusMessages[status] || 'Неизвестная ошибка'}: ${exceptionMessage}`
          : statusMessages[status] || 'Неизвестная ошибка';
    }
    // обраб.ошб.БД: нарушения уникальности <> пустых значений
    else if (
      exception instanceof Error &&
      (exception as any).code === '23505'
    ) {
      const errorMessage =
        (exception as any).detail
          // удал.скобки
          ?.replace(/[()]/g, '')
          // замена двойных на одинарные кавычки
          .replace(/"([^"]+)"/g, "'$1'") ||
        'Пользователь уже существует. Замените fullName или email';
      message = errorMessage;
    } else {
      message = statusMessages[status] || 'Неизвестная ошибка';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message /* : exception instanceof HttpException ? exception.message : message */,
      error:
        exception instanceof Error ? exception.message : 'Неизвестная ошибка',
      // ...(exception instanceof HttpException && exception.getResponse && { error: exception.getResponse() }),
    };

    this.logger.error(
      `ОШБ.: Статус ${status} на ${request.url}: ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
