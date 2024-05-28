// ^ logger на winston
// import * as winston from 'winston';
import { createLogger, transports, format } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

// константы > команды запуска process.env.NODE_ENV, winston
import { isProduction } from './envs/env.consts';
const { timestamp, combine, json, errors } = format;

export const WinstonLoggerProvider = {
  provide: 'WINSTON_LOGGER',
  useFactory: () => {
    return createLogger({
      // level: 'info',
      // levles: npm.levels,
      level: isProduction ? 'info' : 'debug',
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: 'app222-%DATE%.log',
          zippedArchive: true,
          dirname: path.join(process.cwd(), 'src/tmp/logs'),
        }),
      ],
    });
  },
};
