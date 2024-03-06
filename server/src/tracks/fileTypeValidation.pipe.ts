import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { fromBuffer } from 'file-type';
import * as fs from 'fs';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File[] | any /* // ! УБРАТЬ ANY */) {
    // обраб.ошб.пустого value
    if (!value) {
      throw new BadRequestException('Отсутствуют загруженные файлы.');
    }

    // перем.хран.данн.ф.разных типов
    const fileData = {};

    // Перебор ключей value и обраб.соответ.ф.
    for (const key of Object.keys(value)) {
      if (value[key] && value[key].length > 0) {
        fileData[key] =
          value[key][0].buffer || fs.readFileSync(value[key][0].path);
      }
    }

    // опред.MIME типа > каждого типа файла
    const mimeTypes = {};
    for (const key of Object.keys(fileData)) {
      const { mime } = await fromBuffer(fileData[key]);
      mimeTypes[key] = mime;
    }

    // разреш.Типы ф. > каждого типа
    const allowedTypes = {
      audio: [
        'audio/wav',
        'audio/flac',
        'audio/ogg',
        'audio/mpeg',
        'audio/aiff',
      ],
      image: [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ],
      video: ['video/mp4', 'video/quicktime', 'video/mpeg'],
      schema: ['application/json', 'application/xml', 'text/csv'],
    };

    // проверка MIME типов и выбрасывание ошибки при несоответствии
    for (const key of Object.keys(fileData)) {
      if (allowedTypes[key] && !allowedTypes[key].includes(mimeTypes[key])) {
        throw new BadRequestException(
          `${key} должен быть одним из допустимых типов файлов.`,
        );
      }
    }

    return value;
  }
}
