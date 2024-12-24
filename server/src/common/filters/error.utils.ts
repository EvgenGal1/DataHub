// ^ универ.общ.fn > выброса ошб. status/msg

import {
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotAcceptableException,
  ConflictException,
  GoneException,
  InternalServerErrorException,
} from '@nestjs/common';

const statusMessages = {
  [HttpStatus.NOT_FOUND]: 'Ресурс не найден',
  [HttpStatus.BAD_REQUEST]: 'Ошибка запроса, некорректные данные',
  [HttpStatus.UNAUTHORIZED]: 'Доступ к ресурсу запрещён',
  [HttpStatus.FORBIDDEN]: 'У вас нет прав для доступа',
  [HttpStatus.NOT_ACCEPTABLE]: 'Запрос не обработан, формат данных неприемлем',
  [HttpStatus.CONFLICT]: 'Конфликт данных',
  [HttpStatus.GONE]: 'Запрашиваемый ресурс больше не доступен',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Внутренняя ошибка сервера',
};

/**
 * Функция для выбрасывания HTTP ошибок
 * @param status Код статуса HTTP
 * @param customMessage Пользовательское сообщение об ошибке
 */
export function ThrowError(status: HttpStatus, customMessage?: string) {
  const message =
    customMessage || statusMessages[status] || 'Неизвестная ошибка';

  switch (status) {
    case HttpStatus.NOT_FOUND:
      throw new NotFoundException(message);
    case HttpStatus.BAD_REQUEST:
      throw new BadRequestException(message);
    case HttpStatus.UNAUTHORIZED:
      throw new UnauthorizedException(message);
    case HttpStatus.FORBIDDEN:
      throw new ForbiddenException(message);
    case HttpStatus.NOT_ACCEPTABLE:
      throw new NotAcceptableException(message);
    case HttpStatus.CONFLICT:
      throw new ConflictException(message);
    case HttpStatus.GONE:
      throw new GoneException(message);
    case HttpStatus.INTERNAL_SERVER_ERROR:
      throw new InternalServerErrorException(message);
    default:
      throw new InternalServerErrorException(message);
  }
}
