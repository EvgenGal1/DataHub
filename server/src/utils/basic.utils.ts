// ^^ различные/помошники
import * as fs from 'fs';
import * as mm from 'music-metadata';
// import chardet from 'chardet';
// import iconv from 'iconv-lite';
const iconv = require('iconv-lite');

// @Injectable()
export class BasicUtils {
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

  // `получить мета данн.аудио файла`. Возврат объ.с ключ:стр.
  async getAudioMetaData(
    audio: Express.Multer.File,
  ): Promise<{ [key: string | number]: any }> {
    console.log('getAudioMetaData 0 audio : ', audio);

    let audioMetaData;
    if (audio.buffer) {
      audioMetaData = audio.buffer;
    } else if (audio.path) {
      audioMetaData = fs.readFileSync(audio.path);
    }

    const metadata = await mm.parseBuffer(audioMetaData);
    console.log('meta-data_Audi format', metadata.format);
    console.log('meta-data_Audi common', metadata.common);

    // `всего секунд` верн.ближ.целое число(округ.до ближ.цел.значения / раздел.на 60)=получ.цел.сек. + ":" + округ.до ближ.цел.значения % раздел.на остаток 60=получ.остаток секунд
    const totalSeconds =
      String(Math.floor(Math.round(metadata.format.duration) / 60)) +
      ':' +
      String(Math.round(metadata.format.duration) % 60);

    const result = {};
    // fn проверки на пусто/кодировки и добавл.ключ.:значен.
    function addToResult(
      key: string,
      value /* : string | number | null | string[] */,
    ) {
      if (!value) return;
      // данн.из масс. > стр.
      if (Array.isArray(value)) {
        value = value.length === 1 ? value[0] : value.join(', ');
      }
      console.log('value 000 : ', value);

      // наличие букв RU/EN, цифр в названии
      const regExStand = /^[а-яА-Яa-zA-Z0-9\s]+$/u;
      // налич.: любой в([) букв(p{L}),пробел(s),цифра(d),знаки(.,&!@#%()-) ] повтор(+) регистр(i)Юникод(u)
      const regExpHard = /^([\p{L}\s\d.,&!@#%()-]+)$/iu;
      // проверка на UTF8 // Windows1251
      const isValidUtf8 = /^[\x00-\x7F\xC2-\xFD]+$/; // /^[\x00-\xFF]+$/
      // const isValidWindows1251 = ;

      // условие по региляр.выраж. напрямую <> перекод.URI <> перекод.UTF8
      if (regExStand.test(value) && regExpHard.test(value)) {
        console.log('value 0 : ', value);
        // формир.объ.ключ.знач.
        result[key] = value;
      }
      if (!regExStand.test(value)) {
        console.log('value 2 : ', value, typeof value);
        try {
          value = decodeURIComponent(escape(value));
        } catch (error) {
          value = decodeURIComponent(value);
        }
        result[key] = value;
        console.log('value 2== : ', value);
        // доп.перекод.на пакетах iconv-lite и chardet // ! не раб - iconv.decode
        // const detectedEncoding = chardet.detect(Buffer.from(value));
        // const result = iconv.decode(Buffer.from(value), detectedEncoding);
      }
      if (isValidUtf8.test(value)) {
        console.log('value 4 : ', value, typeof value);
        // перекодировка value в utf8
        value = decodeURIComponent(value);
        console.log('value 4== : ', value);
        // формир.объ.ключ.знач.
        result[key] = value;
      }
      if (!isValidUtf8.test(value)) {
        console.log('value 1 : ', value, typeof value);
        // перекодировка value в utf8
        value = Buffer.from(String(value), 'utf8').toString('utf8');
        console.log('value 1== : ', value);
        // формир.объ.ключ.знач.
        result[key] = value;
      }
      if (/[\u00C0-\u017F]/.test(value)) {
        console.log('value 3 : ', value, typeof value);

        value = iconv.decode(value, 'windows-1251'); // utf8 <> win1251
        // const value1 = iconv.encode(iconv.decode(value, 'win1251'), 'utf8');

        // формир.объ.ключ.знач.
        result[key] = value;
      }
    }
    // разреш.парам. Вызов кажд.поля
    addToResult('artist', metadata.common.artist);
    addToResult('title', metadata.common.title);
    addToResult('originalname', audio.originalname);
    addToResult('genre', metadata.common.genre);
    addToResult('year', metadata.common.year);
    addToResult('album', metadata.common.album);
    addToResult('duration', totalSeconds);
    addToResult('sampleRate', metadata.format.sampleRate);
    addToResult('bitrate', metadata.format.bitrate);

    console.log('getAudioMetaData result : ', result);

    return result /* null */;
  }
}
