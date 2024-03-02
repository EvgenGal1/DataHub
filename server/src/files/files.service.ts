import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { FileType, FileEntity, fileTypesAllowed } from './entities/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
import { DatabaseUtils } from 'src/utils/database.utils';
// import { fileTargets } from 'src/helpers/fileTargets';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private databaseUtils: DatabaseUtils,
  ) {}

  // мтд.созд.файла
  async createFile(file: Express.Multer.File, userId: number) {
    // `получить наименьший доступный идентификатор` из БД > табл.file
    const smallestFreeId =
      await this.databaseUtils.getSmallestIDAvailable('file');

    // ^^ настроить паралел.сохр.с тип audio > сохр.в track через serv.track

    // объ.files созд./сохр./вернуть
    const files = {
      id: smallestFreeId,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      target: file.destination,
      size: file.size,
      user: { id: userId },
    };

    return await this.fileRepository.save(files);
  }

  // мтд.созд.файла по Параметрам
  async createFileByParam(
    file: Express.Multer.File,
    fileType: FileType | string,
    userId: number,
  ) {
    console.log(
      'f.serv file | fileType | userId : ',
      file,
      '|',
      // ? нужен ли здесь тип если сохр.в storeF
      fileType,
      '|',
      userId,
    );

    // `получить наименьший доступный идентификатор` из БД > табл.file
    const smallestFreeId =
      await this.databaseUtils.getSmallestIDAvailable('file');

    // ^^ настроить паралел.сохр.с тип audio > сохр.в track через serv.track

    // объ.files созд./сохр./вернуть
    const files = {
      id: smallestFreeId,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      target: file.destination,
      size: file.size,
      user: { id: userId },
    };

    return await this.fileRepository.save(files);
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

  // Проверка наличия типа файла в базе данных
  async fileTypeExists(fileType: string): Promise<boolean> {
    console.log('fileType : ' + fileType);
    // проверяем в БД наличие типа файла
    const result = await this.fileRepository.findOne({
      where: { target: ILike(`%${fileType}%`) },
    });
    console.log('result : ' + result);
    console.log(result);
    return !!result;
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

  async removeFile(userId: number, ids: string) {
    // превращ.ids ф.в масс.
    const idsArray = ids.split(',');
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
}
