import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import * as path from 'path';
// import * as fs from 'fs';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File[] | any /* // ! УБРАТЬ ANY */) {
    // обраб.ошб.пустого value
    if (!value || Object.keys(value).length === 0) {
      throw new /* BadRequestException */ NotFoundException(
        'Ошибка сохранения данных в БД',
        'Нет файлов загрузки',
      );
    }

    console.log('fTypValid value : ', value);

    // Перебор ключей value и обраб.соответ.ф.
    for (const key of Object.keys(value)) {
      if (value[key] && value[key].length > 0) {
        // разреш.Типы ф. > каждого типа
        const allowedTypes = {
          audio: ['.mp3', '.wav', '.flac', '.aac', '.aiff', '.ogg', '.wma'],
          image: ['.ico', '.jpg', '.jpeg', '.png', '.gif', '.bmp'],
          video: ['mp4', 'quicktime', 'mpeg'],
          schema: ['json', 'xml', 'csv'],
        };
        // объ.ф.
        const valueKey = value[key][0];
        // тип файла
        const fileMimeType = valueKey.mimetype.split('/')[0]; // audio <> image
        // `разрешенные типы файлов`
        const allowedFileTypes = allowedTypes[fileMimeType]; // ['.mp3','.wav','.flac',...
        // извлеч.расшир.ф.
        const fileExtension = path.extname(valueKey.originalname); // .mp3 <> .jpg
        // разреш. <> ошб. от соответствия значений fileExtension(расшир.ф.) к allowedFileTypes(разреш.расшир.)
        if (!allowedFileTypes.includes(fileExtension)) {
          const err = `Поле загрузки '${key}' должно иметь один из допустимых форматов файла - '${allowedFileTypes.join()}. Передан '${fileExtension}''`;
          console.log('fTypValid err : ', err);
          throw new BadRequestException('Ошибка сохранения данных в БД', err);
        }
      }
    }

    console.log('fTypValid value = : ', value);
    return value;
  }
}
