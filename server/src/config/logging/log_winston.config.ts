// ^ logger на winston

import { Injectable, Scope } from '@nestjs/common';
import { createLogger, transports, transport, format, Logger } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
// import { ExceptionLogger } from 'nest-exceptions';

// константы > команды запуска process.env.NODE_ENV, winston
import { isDevelopment } from '../envs/env.consts';
const { colorize, timestamp, combine, json, printf, errors } = format;

// уровни логирования
const customLevels = {
  levels: {
    silly: 0,
    debug: 1,
    verbose: 2,
    info: 3,
    log: 4,
    warn: 5,
    error: 6,
  },
};

@Injectable({ scope: Scope.DEFAULT })
export class LoggingWinston {
  private readonly logger: Logger;

  constructor() {
    // масс.кмд.запуска/транспорт > лог-ия
    const transportsArray: transport[] = [
      // консол.транспорт > всех окружений
      new transports.Console({
        level: isDevelopment ? 'debug' : 'info',
        format: combine(
          colorize(),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          printf(({ timestamp, level, message, context, stack }) => {
            return `${timestamp} ${level}: ${message}${context ? ' | ' + context : ''}${stack ? '\nStack' + stack : ''}`;
          }),
          errors({ stack: true }),
          json(),
        ),
      }),
    ];

    // DEV|TOTAL + доп.кмд. (ф.)
    if (isDevelopment) {
      transportsArray.push(
        // new FileRotateTransport // настр. > Elasticsearch + Kibana
        // ! ошб.врем.откл. - ошб.vercel - read-only file system, mkdir '/var/task/' | '/var/logs/'
        // детал.настр.общ.ф.логов > кажд.день
        new transports.DailyRotateFile({
          filename: 'app(DailyRotate)__%DATE%__ALL.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          dirname: path.join(process.cwd(), '/tmp/logs'),
        }),
        // доп.ф. > лог.ошб.
        new transports.File({
          filename: 'app(File)__ERR.log',
          level: 'error',
          zippedArchive: true,
          dirname: path.join(process.cwd(), '/tmp/logs'),
        }),
      );
    }

    // созд.логгера с настр. формата/уровня > dev/prod
    this.logger = createLogger({
      level: isDevelopment ? 'debug' : 'info',
      // levels: customLevels.levels, // ! нет записи лога
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: transportsArray,
    });
  }

  // мтд.ур.логг.
  log(message: string) {
    this.logger.log({ level: 'info', message });
  }

  debug(message: string, context?: string | number) {
    this.logger.debug({ message, context });
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  info(message: string, context?: string | number) {
    this.logger.info({ message, context });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  error(message: string, context?: string | number) {
    this.logger.error({ message, context });
    // this.exceptionLogger.captureException(new Error(message));
  }
}
