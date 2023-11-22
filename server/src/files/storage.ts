// лог.хран-ща.ф. + генер.уник.id/имён
import { diskStorage } from 'multer';

// генер.уник.id
const generateId = () =>
  Array(18)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

// генер.уник.имён ч/з generateId
const normalizeFileName = (req, file, callback) => {
  const fileExtName = file.originalname.split('.').pop();
  callback(null, `${generateId()}.${fileExtName}`);
};

// `файловое хранилище` = `дисковое хранилище`
export const fileStorage = diskStorage({
  // `место назначения` + `имя файла`
  destination: './uploads',
  filename: normalizeFileName,
});
