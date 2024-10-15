// ^^ различные/помошники
import * as fs from 'fs';
import * as mm from 'music-metadata';
import iconv from 'iconv-lite';

// логгирование LH
import { LoggingWinston } from '../../services/logging/logging.winston';

// @Injectable()
export class BasicUtils {
  constructor(
    // логгер
    private readonly logger: LoggingWinston,
  ) {}
  // опред.сохр.пути по передан.типу
  static fileTargets(fileType: string): string {
    console.log('BasicUtils fileTargets fileType : ' + fileType);
    switch (fileType) {
      case 'IMAGE':
        return 'images';
      case 'PICTURE':
        return 'images/picture';
      case 'AVATAR':
        return 'users/avatar';
      case 'ALBUM':
      case 'COVER':
        return 'images/album';
      case 'PHOTO':
        return 'users/photo';
      case 'PERSONAL':
        return 'users/personal';
      case 'AUDIO':
        return 'audios';
      case 'AUDIOBOOK':
        return 'audios/audiobook';
      case 'TRACK':
        return 'audios/track';
      case 'BOOK':
        return 'books/book';
      case 'FILE':
        return 'books/file';
      case 'PROSE':
        return 'books/prose';
      case 'CODE':
        return 'prog/code';
      case 'SCHEME':
        return 'prog/scheme';
      case 'BLUEPRINT':
        return 'prog/blueprint';
      default:
        return 'other';
    }
  }

  async logDebugDev(...args: any[]) {
    // лог.в консоль
    console.log(...args);

    // формир.объ.лог
    const logObject = {};
    args.forEach((arg, index) => {
      logObject[`arg${index + 1}`] = arg;
    });

    // лог.logger
    this.logger.debug(`logger : ${JSON.stringify(logObject)}`);
  }

  // опред.типа ошб.
  async hendlerTypesErrors(error: unknown) {
    if (error instanceof Error) {
      // ошб.смс
      return error.message;
    } else if (typeof error === 'string') {
      // стр.
      return error;
    } else if (Array.isArray(error)) {
      // масс.
      return JSON.stringify(error);
    } else if (typeof error === 'object' && error !== null) {
      // объ.
      return JSON.stringify(error);
    } else {
      return 'Неизвестная ошибка';
    }
  }

  // вычисление общего времени в фомате минуты:секунды
  async sumDurations(duration1, duration2) {
    const [min1, sec1] = duration1.split(':').map(Number);
    const [min2, sec2] = duration2.split(':').map(Number);

    let totalSeconds = (min1 + min2) * 60 + sec1 + sec2;
    const totalMinutes = Math.floor(totalSeconds / 60);
    totalSeconds %= 60;

    const totalTime = `${totalMinutes}:${
      totalSeconds < 10 ? '0' : ''
    }${totalSeconds}`;
    console.log('sumDurations totalTime : ', totalTime);
    return totalTime;
  }

  // fn проверки на пусто/кодировки и добавл.ключ.:значен.
  async decodeIntoKeyAndValue(
    key: string,
    value /* : string | number | null | string[] */,
  ) {
    if (!value) return;
    // данн.из масс. > стр.
    if (Array.isArray(value)) {
      value = value.length === 1 ? value[0] : value.join(', ');
    }

    // налич.: любых в([) букв RU/EN,цифр,пробел,знаки(.,&!@#%()-) ] повтор(+)регистр(i)Unicode(u)
    const regExValid = /^[a-zA-Zа-яА-Я0-9\s.,:&!@#%()-]+$/iu;
    // расшир.буквы Unicode - /[\u00C0-\u017F]/;
    // наличие букв RU/EN, цифр в названии - /^[а-яА-Яa-zA-Z0-9\s]+$/iu;
    // налич.: любой в([) букв(p{L}),пробел(s),цифра(d),знаки(.,&!@#%()-) ] повтор(+) регистр(i)Юникод(u) - /^([\p{L}\s\d.,:&!@#%()-]+)$/iu;
    // проверка на UTF8. ASCII 0-255 + двухбайт - /[\x00-\xFF\xC2-\xFD]/;

    const result: { [key: string]: string | number | null } = {};
    // условие по региляр.выраж. напрямую <> перекод.URI <> перекод.UTF8
    if (regExValid.test(value)) {
      // формир.объ.ключ.знач.
      result[key] = value;
    } else if (!regExValid.test(value)) {
      value =
        key === 'originalname'
          ? decodeURIComponent(escape(value)) // decodeURIComponent(value)
          : iconv.decode(value, 'windows-1251'); // utf8 <> win1251
      result[key] = value;
      // перекодировка value в utf8
      // value = Buffer.from(String(value), 'utf8').toString('utf8');
      // доп.перекод.на пакетах iconv-lite и chardet // ! не раб - iconv.decode
      // const detectedEncoding = chardet.detect(Buffer.from(value));
      // const result = iconv.decode(Buffer.from(value), detectedEncoding);
    }
    return result[key];
  }

  // `получить мета данн.аудио файла`. Возврат объ.с ключ:стр.
  async getAudioMetaData(
    audio: Express.Multer.File,
  ): Promise<{ [key: string | number]: any }> {
    let audioMetaData;
    if (audio.buffer) {
      audioMetaData = audio.buffer;
    } else if (audio.path) {
      audioMetaData = fs.readFileSync(audio.path);
    }

    const metadata = await mm.parseBuffer(audioMetaData);

    // `всего секунд` верн.ближ.целое число(округ.до ближ.цел.значения / раздел.на 60)=получ.цел.сек. + ":" + округ.до ближ.цел.значения % раздел.на остаток 60=получ.остаток секунд
    const totalSeconds =
      String(Math.floor(Math.round(metadata.format.duration) / 60)) +
      ':' +
      String(Math.round(metadata.format.duration) % 60);

    const result /* : AudioMetadata */ = {};

    // разреш.парам. Вызов кажд.поля
    result['artist'] = await this.decodeIntoKeyAndValue(
      'artist',
      metadata.common.artist,
    );
    result['title'] = await this.decodeIntoKeyAndValue(
      'title',
      metadata.common.title,
    );
    result['originalname'] = await this.decodeIntoKeyAndValue(
      'originalname',
      audio.originalname,
    );
    result['genre'] = await this.decodeIntoKeyAndValue(
      'genre',
      Number(metadata.common.genre),
    );
    result['year'] = await this.decodeIntoKeyAndValue(
      'year',
      metadata.common.year,
    );
    result['album'] = await this.decodeIntoKeyAndValue(
      'album',
      metadata.common.album,
    );
    result['duration'] = await this.decodeIntoKeyAndValue(
      'duration',
      totalSeconds,
    );
    result['sampleRate'] = await this.decodeIntoKeyAndValue(
      'sampleRate',
      metadata.format.sampleRate,
    );
    result['bitrate'] = await this.decodeIntoKeyAndValue(
      'bitrate',
      metadata.format.bitrate,
    );

    console.log('getAudioMetaData result : ', result);

    return result;
  }
}
