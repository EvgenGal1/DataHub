// ^^ лог.хран-ща.ф. + MW.multer обраб.ф.>загр.формата multipart/form-data(локал.хран.ф.diskStorage) + генер.уник.id/имён
import * as multer from 'multer';
import * as path from 'path';

import { fileTargets } from 'src/helpers/fileTargets';

// MW > сохр.неск.ф. `файловое хранилище` = `дисковое хранилище`
export const fileStorage = multer.diskStorage({
  // `место назначения`
  destination: (req, file, cb) => {
    // Баз.п./Путь
    const baseFolder = './static/';
    // формир.путь по расширению или типу
    let fileTarget: string | Promise<string>;
    // е/и нет req.query.fileType
    if (file.fieldname && !req.query.fileType) {
      // список `разреш.расшир.` > изо
      const allowedExtensionsImg = [
        '.ico',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.bmp',
      ];
      // список `разреш.расшир.` > аудио
      const allowedExtensionsAud = [
        '.mp3',
        '.wav',
        '.flac',
        '.aac',
        '.aiff',
        '.ogg',
        '.wma',
        '.m4a',
      ];

      // извлеч.расшир.ф.
      const fileExtension = file.originalname
        .substring(file.originalname.lastIndexOf('.'))
        .toLowerCase();
      // сравн.знач. доступ.<>расшир.
      if (allowedExtensionsImg.includes(fileExtension))
        fileTarget = 'images/picture';
      else if (allowedExtensionsAud.includes(fileExtension))
        fileTarget = 'audios/track';
      // ^^ настр.др.расшир.
      else fileTarget = 'other';
    }
    // по переданному Типу
    else if (req.query.fileType) {
      fileTarget = fileTargets(String(req.query.fileType).toUpperCase());
    }
    // общий путь
    const destinationPath = baseFolder + fileTarget + '/';
    console.log('fileStorage destinationPath : ' + destinationPath);
    cb(null, destinationPath);
  },

  // `имя файла`
  filename: (req, file, cb) => {
    let fileNameReturn: string;

    // проверки читаемости имени трека
    // наличие букв(RU/EN,цифры) в названии
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
    console.log('fileStorage fileNameReturn : ' + fileNameReturn);
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
