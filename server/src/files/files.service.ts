import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { FileType, FileEntity, fileTypesAllowed } from './entities/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
import { DatabaseUtils } from 'src/utils/database.utils';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private dataBaseUtils: DatabaseUtils,
  ) {}

  // мтд.созд.файла по Параметрам
  async createFileByParam(
    file: Express.Multer.File,
    userId: number,
    fileType?: FileType | null,
  ) {
    console.log(
      'f.serv.Param file | userId | fileType : ',
      file,
      '|',
      userId,
      '|',
      // ? нужен ли здесь тип если сохр.в storeF
      fileType,
    );

    // перем.сохр.File
    let savedFile;
    try {
      // `получить наименьший доступный идентификатор` из БД > табл.file
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('file');

      // ^^ настроить паралел.сохр.с тип audio > сохр.в track через serv.track

      // проверка на Unicode
      const isValidUtf8 = /^[\x00-\x7F\xC2-\xFD]+$/;

      // объ.files созд./сохр./вернуть
      const files = {
        id: smallestFreeId,
        filename: file.filename,
        originalname: isValidUtf8.test(file.originalname)
          ? file.originalname
          : decodeURIComponent(escape(file.originalname)),
        mimetype: file.mimetype,
        target: file.destination,
        size: file.size,
        user: { id: userId },
      };
      console.log('f.serv.Param files : ', files);
      savedFile = await this.fileRepository.save(files);
      return savedFile;
    } catch (error) {
      console.log('f.serv.Param catch error : ', error);
      // удал.записи табл./ф. при неудачн.загр.
      if (!savedFile) {
        // удален.ф.с локал.хран.
        // fs.promises
        //   .unlink(savedTrack.path)
        //   .catch((error) => console.error(`Ошибка удаления файла: ${error}`));
        // удален.записи табл.
        await this.deleteTrack(savedFile.id);
      }
      throw new NotFoundException('Ошибка сохранения файла в БД', error);
    }
  }

  // мтд.получ.ф. Все/Тип. // возвращ.ф.опред.user и с опред.типом(декор.Query)
  async findAllFiles(userId: number, fileTypes: any /* FileType[] */) {
    console.log('f.serv. userId fileTypes:', userId, fileTypes);

    // `допустимые типы`. Сравнение входа(fileTypes) с `разрешенными типами ф.`(fileTypesAllowed)
    const validTypes = fileTypes.filter((type: string) =>
      fileTypesAllowed.includes(type.toLowerCase()),
    );

    // проверка на `неверные типы`. Е/и разные типы вход/разрешен.(fileTypes/fileTypesAllowed) и нужен ответ о не разрешённых
    // const invalidTypes = fileTypes.filter((type) => !validTypes.includes(type));
    // if (invalidTypes.length > 0) {return `Тип(ы) файла ${invalidTypes.join(', ',)} отсутствует в базе данных.`;}

    // генер.спец.SQL req > "создать строитель запросов"
    const qb = this.fileRepository.createQueryBuilder('file');

    // req > id user
    qb.where('file.userId = :userId', { userId });

    // Если переданы все типы файлов или не указано значение, возвращаем все файлы
    // ! Аргумент типа ""all"" нельзя назначить параметру типа "FileType" (вход.props)
    if (validTypes.includes('all') || validTypes.length == 0) {
      console.log('Возвращение всех файлов');
      return qb.getMany();
    }

    // составн.req > все `допустимые типы`
    if (validTypes.length > 0) {
      console.log(`Возвращение <${validTypes.join(', ')}> файлы`);
      qb.andWhere('file.target ILIKE ANY(:types)', {
        types: validTypes.map((type) => `%${type}%`),
      });
    }

    // кол-во записей
    const count = await qb.getCount();
    console.log('count:', count);

    // проверка наличия данных в БД
    if (count === 0) {
      return 'Нет данных для указанных типов файлов.';
    }

    // возврат.данн.
    return qb.getMany();
  }

  async findOneFile(id: number) {
    return this.fileRepository.findOneBy({ id });
  }

  async updateFile(
    id: number,
    updateFileDto: UpdateFileDto,
  ): Promise<FileEntity> {
    // return this.fileRepository.update(id, UpdateFileDto); // ! ошб. т.к. возвращ.UpdateResult, а не TrackEntity
    await this.fileRepository.update(id, updateFileDto);
    const updatedTrack = await this.fileRepository.findOneBy({ id });
    if (!updatedTrack) throw new Error('Трек не найден');
    return updatedTrack;
  }

  // Пометка Удаления
  async removeFile(userId: number, ids: any /* string | number */) {
    console.log('f.serv DEL id : ' + ids);

    // превращ.ids ф.в масс.
    let idsArray: number[] = [];
    if (isNaN(Number(ids))) {
      // Если ids не является числом, разбиваем строку на массив
      idsArray = ids.split(',').map((id) => parseInt(id.trim(), 10));
    } else {
      // Если ids является числом, добавляем его в массив
      idsArray.push(parseInt(ids, 10));
    }

    // генер.спец. SQL req ч/з `Создать строитель запросов`
    const qb = this.fileRepository.createQueryBuilder('files');
    // наход.ф.по ids И userId
    qb.where('id IN (:...ids) AND userId = :userId', {
      ids: idsArray,
      userId,
    });

    // пометка `мягк.удал.`ф.
    return qb.softDelete().execute();
  }

  // Удаление
  async deleteTrack(id: number /* ObjectId */) /* : Promise<ObjectId> */ {
    // запись > удал.; delete - удал.
    return this.fileRepository.delete(id);
  }

  // Проверка наличия типа файла в базе данных
  async fileTypeExists(fileType: string): Promise<boolean> {
    console.log('fileType : ' + fileType);
    // проверяем в БД наличие типа файла
    const result = await this.fileRepository.findOne({
      where: { target: ILike(`%${fileType}%`) },
    });
    console.log('result : ', result);
    return !!result;
  }
}
