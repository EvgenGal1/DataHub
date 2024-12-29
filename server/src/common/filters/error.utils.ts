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

const errorConfig = [
  {
    status: HttpStatus.NOT_FOUND,
    message: 'Ресурс не найден',
    exception: NotFoundException,
  },
  {
    status: HttpStatus.BAD_REQUEST,
    message: 'Ошибка запроса, некорректные данные',
    exception: BadRequestException,
  },
  {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Доступ к ресурсу запрещён',
    exception: UnauthorizedException,
  },
  {
    status: HttpStatus.FORBIDDEN,
    message: 'У вас нет прав для доступа',
    exception: ForbiddenException,
  },
  {
    status: HttpStatus.NOT_ACCEPTABLE,
    message: 'Запрос не обработан, формат данных неприемлем',
    exception: NotAcceptableException,
  },
  {
    status: HttpStatus.CONFLICT,
    message: 'Конфликт данных',
    exception: ConflictException,
  },
  {
    status: HttpStatus.GONE,
    message: 'Запрашиваемый ресурс больше не доступен',
    exception: GoneException,
  },
  {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Внутренняя ошибка сервера',
    exception: InternalServerErrorException,
  },
];

/**
 * Функция для выбрасывания HTTP ошибок
 * @param status Код статуса HTTP
 * @param customMessage Пользовательское сообщение об ошибке
 */
export function ThrowError(status: HttpStatus, customMessage?: string) {
  const config = errorConfig.find((config) => config.status === status);
  const message =
    customMessage || (config ? config.message : 'Неизвестная ошибка');
  const ExceptionClass = config
    ? config.exception
    : InternalServerErrorException;

  throw new ExceptionClass(message);
}
