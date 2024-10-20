// ^ logger на winston
import { createLogger, transports, format, transport } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

// константы > команды запуска process.env.NODE_ENV, winston
import { isProduction, isDevelopment, isTotal } from '../envs/env.consts';
const { timestamp, combine, json, errors } = format;

export const WinstonLoggerProvider = {
  provide: 'WINSTON_LOGGER',
  useFactory: () => {
    // масс.кмд.запуска/транспорт > лог-ия
    const transportsArray: transport[] = [
      // консол.транспорт > всех окружений
      new transports.Console({
        level: isDevelopment ? 'debug' : 'info',
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          json(),
        ),
      }),
    ];
    // DEV|TOTAL + доп.кмд. (ф.)
    if (isDevelopment || isTotal) {
      // файлы для dev и total
      transportsArray.push(
        // new FileRotateTransport // настр. > Elasticsearch + Kibana
        // ! ошб.врем.откл. - ошб.vercel - read-only file system, mkdir '/var/task/' | '/var/logs/'
        // детал.настр.ф. > кажд.день
        new transports.DailyRotateFile({
          filename: 'app(DailyRotate)-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          dirname: path.join(
            // __dirname,
            process.cwd(),
            // isProduction ? './src/tmp/logs' : './src/tmp/logs',
            '/tmp/logs',
          ),
        }),
        // доп.ф. > обычн.лог.
        new transports.File({
          filename: `app(File)-ALL.log`,
          zippedArchive: true,
          dirname: path.join(process.cwd(), '/tmp/logs'),
        }),
      );
    }

    // созд.логгера с настр. формата/уровня > dev/prod
    return createLogger({
      // levels: config.npm.levels,
      level: isDevelopment ? 'debug' : 'info',
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: transportsArray,
    });
  },
};
