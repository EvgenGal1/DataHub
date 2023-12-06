// ^^ лог.хран-ща.ф. + MW.multer обраб.ф.>загр.формата multipart/form-data(локал.хран.ф.diskStorage) + генер.уник.id/имён
import * as multer from 'multer';
import * as path from 'path';

import { fileTargets } from 'src/helpers/fileTargets';

// MW > сохр.неск.ф. `файловое хранилище` = `дисковое хранилище`
export const fileStorage = multer.diskStorage({
  // = diskStorage({ - один файл
  // `место назначения`
  destination: (req, file, cb) => {
    console.log('fileStorage file 0 : ', file);
    // Баз.п./Путь
    const baseFolder = './static/';
    // формир.путь от выбранного типа
    let fileTarget: string | Promise<string>;
    // е/и нет req.query
    if (file.fieldname && !req.query.fileType) {
      fileTarget = fileTargets(file.fieldname.toUpperCase());
    } else if (req.query.fileType) {
      fileTarget = fileTargets(String(req.query.fileType).toUpperCase());
    }
    // общий путь
    const destinationPath = baseFolder + fileTarget + '/';
    console.log('fileStorage destinationPath : ' + destinationPath);
    cb(null, destinationPath);
  },
  // `имя файла`
  filename: (req, file, cb) => {
    // формат даты - 01-12-2023
    const formattedDate = new Date()
      .toLocaleDateString('RU')
      .split('.')
      .join('-');
    // формир.Random
    const Random = Array(18)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    // формир.Имя
    const fileNameDateRandomExt = `${formattedDate}_${Random}${path.extname(
      file.originalname,
    )}`;
    console.log('fileStorage fileNameDateRandomExt : ' + fileNameDateRandomExt);
    cb(null, fileNameDateRandomExt);
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
