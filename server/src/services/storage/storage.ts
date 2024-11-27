// ^^ лог.хран-ща.ф. + MW.multer обраб.ф.>загр.формата multipart/form-data(локал.хран.ф.diskStorage) + генер.уник.id/имён

import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';
// константы > команды запуска process.env.NODE_ENV
import { isDevelopment } from '../../config/envs/env.consts';
// типы/пути файлов
import { FilePaths } from '../../common/types/typeFilePaths';
// mapping связь ф.mimeType с FilePaths
import { mappingMimeType } from '../../common/mappings/mappingMimeType';

// логгирование
const logger = new LoggingWinston();

// MW > сохр.ф.в локальное хранилище
export const fileStorage = multer.diskStorage({
  // `место назначения`
  destination: (req, file, cb) => {
    if (isDevelopment) logger.info(`flStor DES.file '${JSON.stringify(file)}'`);

    if (!file) {
      logger.error(`ОШБ.сохр.ф.в Хранилище - ф.нет'`);
      return cb(new NotFoundException('ОШБ.сохр.ф.в Хранилище', 'ф.нет'), null);
    }

    // баз.п. / путь/имя по ф.mimetype <> ф.filePaths
    const baseFolder = isDevelopment
      ? process.env.LH_PUB_DIR
      : process.env.SRV_PUB_DIR;
    let fileTarget: string;

    // путь по filePaths е/и не 'all'
    if (req?.query?.filePaths && String(req?.query?.filePaths) !== 'all') {
      fileTarget = String(req.query.filePaths);
    } else {
      // типы файла
      const [fileMimeType, fullMimeType] = file.mimetype.split('/');

      // путь по соответ. типу ф.
      fileTarget = mappingMimeType[fileMimeType] || FilePaths.OTHER;

      // доп.обраб. > application, text
      if (typeof fileTarget !== 'string') {
        if (fileMimeType === 'application') {
          fileTarget =
            mappingMimeType.application[fullMimeType] || FilePaths.OTHER;
        } else if (fileMimeType === 'text') {
          fileTarget = mappingMimeType.text[fullMimeType] || FilePaths.OTHER;
        }
      }
      if (!fileTarget) {
        logger.error(
          `ОШБ.сохр.ф.в Хранилище - ф. '${file.originalname}' с типом '${file.mimetype}' - Не поддерживается`,
        );
        return cb(
          new BadRequestException(
            'ОШБ.сохр.ф.в Хранилище',
            `Ф. '${file.originalname}' с типом '${file.mimetype}' - Не поддерживается`,
          ),
          null,
        );
      }
    }

    // формир.путь сохран.
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      baseFolder,
      fileTarget,
    ); // D:\Про\Творения\FullStack\Data-Hub\server\static\...
    // альтер.сохр.п./ф. // ! не раб. - file.buffer = undf
    // fs.writeFileSync(path.resolve(filePath, fileName), file.buffer)
    // провер./созд.п.хран.
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    if (isDevelopment) logger.info(`flStor DES.filePath '${filePath}'`);

    cb(null, filePath);
  },

  // `имя файла`
  filename: (req, file, cb) => {
    if (isDevelopment) logger.info(`flStor FIL.file '${JSON.stringify(file)}'`);

    let fileName: string;

    // регуляр.выраж. > проверки имени файла ч/з
    // наличие букв RU/EN, цифр в названии
    const regExStandard = /^[а-яА-Яa-zA-Z0-9\s]+$/u;
    // налич.: любой в([) букв(p{L}),пробел(s),цифра(d),знаки(.,&!@#%()-) ] повтор(+) регистр(i)Юникод(u)
    const regExpHard = /^([\p{L}\s\d.,&!@#%()-]+)$/iu;

    // генер.случайной строки
    const generateRandomString = (length: number): string => {
      return Array.from({ length }, () =>
        Math.round(Math.random() * 16).toString(16),
      ).join('');
    };
    // форматирование даты
    const getFormattedDate = (): string => {
      return new Date().toISOString().split('T')[0]; // YYYY-MM-DD > БД
    };

    // стандарт.декод.имя ф. (URI).
    if (!regExStandard.test(file.originalname))
      fileName = decodeURIComponent(escape(file.originalname));
    // имя по Unicode
    else if (regExpHard.test(file.originalname)) fileName = file.originalname;
    // нов.имя ф.
    else {
      const formattedDate = getFormattedDate();
      const randomString = generateRandomString(5);
      // формир.Имя
      fileName = `${formattedDate}_${randomString}${path.extname(file.originalname)}`;
    }

    if (isDevelopment) logger.info(`flStor FIL.filename '${fileName}'`);

    cb(null, fileName);
  },
});
