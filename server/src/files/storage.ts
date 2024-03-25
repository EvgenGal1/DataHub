// ^^ лог.хран-ща.ф. + MW.multer обраб.ф.>загр.формата multipart/form-data(локал.хран.ф.diskStorage) + генер.уник.id/имён
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { fileTargets } from 'src/helpers/fileTargets';

// MW > сохр.неск.ф. `файловое хранилище` = `дисковое хранилище`
export const fileStorage = multer.diskStorage({
  // `место назначения`
  destination: (req, file, cb) => {
    console.log('flStor DES.file : ', file);

    if (file === undefined || file === null) {
      throw new NotFoundException('Ошибка сохранения данных в БД', 'нет файла');
    }
    // Баз.п./Путь
    const baseFolder = 'static';
    // перем.путь по расширению <> типу
    let fileTarget: string;

    // опред.путь. по переданному Типу
    if (req.query.fileType) {
      fileTarget = fileTargets(String(req.query.fileType).toUpperCase());
    }
    // по fieldname(типу загр.) и mimetype(типу файла)
    else {
      // `соответствие типов файлов`
      const fileTypeMappings = {
        audio: ['track', 'audiobook', 'sounds'],
        image: ['album', 'cover', 'picture', 'image'],
      };
      // тип файла
      const fileMimeType = file.mimetype.split('/')[0]; // audio <> image <> ...
      // альтер.получ.тип ч/з ключи масс.соответствий по нач.знач.mimetype - Object.keys(fileTypeMappings).find((type) => file.mimetype.startsWith(type), );
      // `разрешенные типы файлов`
      const allowedFileTypes = fileTypeMappings[fileMimeType]; // track,audiobook,sounds <> ...
      // опред.путь <> ошб. от соответствия значений fieldname(поле загр.) к fileTypeMappings(типам ф.)
      if (allowedFileTypes && allowedFileTypes.includes(file.fieldname)) {
        fileTarget = fileTargets(String(file.fieldname).toUpperCase());
      } else {
        const err = `Несоответствие типов. Передан файл '${file.originalname}' с типом '${file.mimetype}', а должен быть '${file.fieldname}'`;
        console.log('flStor err : ', err);
        const error = new /* NotFoundException */ BadRequestException(
          'Ошибка сохранения данных в БД',
          err,
        );
        // if (file.fieldname === 'track') return cb(error, null);
        // if (file.fieldname === 'cover') return cb(error, null);
        return cb(error, null);
        // ! не раб.ошб. SWAGGER >> Loading >> Undocumented - Failed to fetch. - Possible Reasons: CORS > Network Failure > URL scheme must be "http" or "https" for CORS request.
        // ~~ после первой отработавшей ошибки, любой ошибочный запрос застревает в Loading и позже падает в ошибку с CORE.
        // ~~ перезагрузки swagger разрешает проблему любого запроса
      }
    }

    // формир.путь сохран. сокращ.ручной <> полн.автомат
    // const destinationPath = baseFolder + '/' + fileTarget; // /static/audios/track/
    const filePath = path.resolve(__dirname, '..', baseFolder, fileTarget); // D:\Про\Творения\FullStack\music-platform_Next-Nest\server\dist\static\audios\track
    // альтер.сохр.п./ф. // ! не раб. - file.buffer = undf
    // fs.writeFileSync(path.resolve(filePath, fileName), file.buffer)

    // провер./созд. папки собраб.ошб.
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }
    // альтер.проверка п.
    // fs.access(filePath, (error) => {
    //   if (error) { fs.mkdir(filePath, { recursive: true }, (err) => {
    //       if (err) { cb(err, null);
    //       } else { cb(null, filePath); } });
    //   } else { cb(null, filePath); }
    // });

    console.log('flStor destination = : ', filePath);
    cb(null, filePath);
  },

  // `имя файла`
  filename: (req, file, cb) => {
    console.log('flStor FIL.file : ', file);
    let fileNameReturn: string;

    // проверки читаемости имени трека
    // наличие букв RU/EN, цифр в названии
    const regExStand = /^[а-яА-Яa-zA-Z0-9\s]+$/u;
    // налич.: любой в([) букв(p{L}),пробел(s),цифра(d),знаки(.,&!@#%()-) ] повтор(+) регистр(i)Юникод(u)
    const regExpHard = /^([\p{L}\s\d.,&!@#%()-]+)$/iu;
    // логика разбора по Unicode, символам, random
    if (!regExStand.test(file.originalname)) {
      // Получает некодируемую версию кодируемого компонента единого идентификатора ресурсов (URI).
      fileNameReturn = decodeURIComponent(escape(file.originalname));
      // перекодирует ч/з буфур в указ.кодировку(utf8). Альтер.вар.для строки без символов
      // fileNameReturn = Buffer.from(file.originalname, 'utf8').toString('utf8');
    } else if (regExpHard.test(file.originalname)) {
      fileNameReturn = file.originalname;
    } else {
      // формат даты - 01-12-2023
      const formattedDate = new Date()
        .toLocaleDateString('ru-RU')
        /* .split('.').join('-') */
        .replace(/\./g, '-');
      // формир.Random
      const Random = Array(5)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      // формир.Имя
      const fileNameDateRandomExt = `${formattedDate}_${Random}${path.extname(
        file.originalname,
      )}`;
      fileNameReturn = fileNameDateRandomExt;
    }
    console.log('flStor filename = : ' + fileNameReturn);
    cb(null, fileNameReturn);
  },
});

// ^^ отдельная логика сохранения с передачей props
// ! не раб. зависает на diskStorage
// export const createFileStorage = async (
//   file?: Express.Multer.File,
//   fileType?: string,
// ) => {
//   // отдельная логика формирования `место назначения` - destinationPath
//   // отдельная формирования `имя файла` - fileNameDateRandomExt
// // ! зависает код в разн.ошб.с разн.returPromise и т.д.
//   const fileStorage = diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, destinationPath);
//     },
//     filename: (req, file, cb) => {
//       cb(null, fileNameDateRandomExt);
//     },
//   })
//   ((null, null) => {
//     if (fileStorage) {
//       resolve(`${destinationPath}/${fileNameDateRandomExt}`);
//     } else {
//       reject('Failed to create file storage');
//     }
//   });
//   return fileStorage;
// };
