// ^ logger на winston
// import * as winston from 'winston';
import { createLogger, transports, format, transport } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

// константы > команды запуска process.env.NODE_ENV, winston
import { /* isProduction, */ isDevelopment, isTotal } from './envs/env.consts';
const { timestamp, combine, json, errors } = format;

export const WinstonLoggerProvider = {
  provide: 'WINSTON_LOGGER',
  useFactory: () => {
    // перем.transport > нес.кмд.запуска
    const transportsArray: transport[] = [new transports.Console()];
    // опред.кмд.запуска
    if (isDevelopment || isTotal) {
      transportsArray.push(
        // new FileRotateTransport // настр. > Elasticsearch + Kibana
        // ! ошб.врем.откл. - ошб.vercel - read-only file system, mkdir '/var/task/' | '/var/logs/'
        // дател.гастр.ф. > кажд.день
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
        new transports.File({
          filename: 'app(File)-%DATE%.log',
          zippedArchive: true,
          dirname: path.join(process.cwd(), '/tmp/logs'),
        }),
      );
    }

    return createLogger({
      // levels: config.npm.levels,
      level: isDevelopment ? 'debug' : 'info',
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: transportsArray,
    });
  },
};
