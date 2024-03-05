// проверка/разрешения Типов загр.ф.
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { fromBuffer } from 'file-type';
import { Express } from 'Express';
import * as fs from 'fs';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File[] | any /* // ! УБРАТЬ ANY */) {
    // перем.:AUDIO IMG. Опред.Тип buffer <> path
    let audioMetaData;
    let imageMetaData;
    if (value.audio[0].buffer) {
      audioMetaData = value.audio[0].buffer;
    } else if (value.audio[0].path) {
      audioMetaData = fs.readFileSync(value.audio[0].path);
    }
    if (value?.album) {
      if (value?.album[0].buffer) {
        imageMetaData = value.album[0].buffer;
      } else if (value.album[0].path) {
        imageMetaData = fs.readFileSync(value?.album[0].path);
      }
    }

    // обнаруж.Тип файла путем проверки магического числа буфера в зависимости от value
    const { mime } = value.audio
      ? await fromBuffer(audioMetaData)
      : await fromBuffer(imageMetaData);

    // разреш.Типы
    const ALLOWED_TYPES_AUD = [
      'audio/wav',
      'audio/flac',
      'audio/ogg',
      'audio/mpeg',
      'audio/aiff',
    ];
    const ALLOWED_TYPES_IMG = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    // вывод ошб.при неудаче
    if (value.audio && !ALLOWED_TYPES_AUD.includes(mime)) {
      throw new BadRequestException(
        'Аудио должно быть либо wav, flac, ogg, mpeg, или aiff.',
      );
    }
    if (value?.album && !ALLOWED_TYPES_IMG.includes(mime)) {
      throw new BadRequestException(
        'Изображения должно быть либо jpg, jpeg, png, webp, или gif.',
      );
    }

    return value;
  }
}
