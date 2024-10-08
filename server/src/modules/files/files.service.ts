/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
// import { Logger } from 'winston';

import { FileType, FileEntity, fileTypesAllowed } from './entities/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../../config/envs/env.consts';

@Injectable()
export class FilesService {
  constructor(
    // логи
    // @Inject('WINSTON_LOGGER') private readonly logger: Logger,
    // ^ подкл.неск.БД.
    // ^ репозитории только > БД SupaBase(SB)
    @Optional()
    @InjectRepository(FileEntity, 'supabase')
    private filesRepositorySB: Repository<FileEntity>,
    // ^ общ.репозит.настр.
    private dataBaseUtils: DatabaseUtils,
    // ^ доп.необязат.репозит(Optional) > БД LocalHost(LH)
    @Optional()
    @InjectRepository(FileEntity, 'localhost')
    private filesRepository?: Repository<FileEntity>,
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
    // логи,перем.ошб.
    // this.logger.info(
    //   `Запись File в БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    // );
    const err = `File не сохранён в БД`;

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
      savedFile = await this.filesRepository.save(files);
      return savedFile;
    } catch (error) {
      console.log('f.serv.Param catch error : ', error);
      // удал.записи табл./ф. при неудачн.загр.
      if (!savedFile) {
        // удален.ф.с локал.хран.
        // fs.promises
        //   .unlink(deleteFile.path)
        //   .catch((error) => console.error(`Ошибка удаления файла: ${error}`));
        // удален.записи табл.
        await this.removeFile(savedFile.id);
      }
      throw new NotFoundException('Ошибка сохранения файла в БД', error);
    }
  }

  // мтд.получ.ф. Все/Тип. // возвращ.ф.опред.user и с опред.типом(декор.Query)
  async findAllFiles(userId: number, fileTypes: any /* FileType[] */) {
    console.log('f.serv. userId fileTypes:', userId, fileTypes);
    // логи,перем.ошб.
    // this.logger.info(
    //   `Получение всех Files из БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    // );
    const err = `Files нет в БД`;

    // `допустимые типы`. Сравнение входа(fileTypes) с `разрешенными типами ф.`(fileTypesAllowed)
    const validTypes = fileTypes.filter((type: string) =>
      fileTypesAllowed.includes(type.toLowerCase()),
    );

    // проверка на `неверные типы`. Е/и разные типы вход/разрешен.(fileTypes/fileTypesAllowed) и нужен ответ о не разрешённых
    // const invalidTypes = fileTypes.filter((type) => !validTypes.includes(type));
    // if (invalidTypes.length > 0) {return `Тип(ы) файла ${invalidTypes.join(', ',)} отсутствует в базе данных.`;}

    // генер.спец.SQL req > "создать строитель запросов"
    const qb = this.filesRepository.createQueryBuilder('file');

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
    // логи,перем.ошб.
    // this.logger.info(
    //   `Получение File по ID ${id} из ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    // );
    const err = `File с ID ${id} нет в БД`;
    return this.filesRepository.findOneBy({ id });
  }

  async updateFile(
    id: number,
    updateFileDto?: UpdateFileDto,
    totalFileData?: any,
  ): Promise<FileEntity> {
    const updatedTrack = await this.filesRepository.findOneBy({ id });

    if (!updateFileDto && totalFileData) {
      console.log('f.s. UPD totalFileData : ', totalFileData);
      await this.filesRepository.update(id, totalFileData);
      return updatedTrack;
    }

    // return this.filesRepository.update(id, UpdateFileDto); // ! ошб. т.к. возвращ.UpdateResult, а не TrackEntity
    await this.filesRepository.update(id, updateFileDto);

    if (!updatedTrack) throw new NotFoundException('Трек не найден');
    return updatedTrack;
  }

  // пометка Удаления
  async removeFile(
    ids: any /* string | number */,
    userId?: number,
    param?: string,
  ) {
    // ошб.е/и нет ID
    if (!ids) {
      throw new NotFoundException('Нет Файла > Удаления');
    }

    // превращ.ids ф.в масс.
    let idsArray: number[] = [];
    if (isNaN(Number(ids))) {
      // Если ids не является числом, разбиваем строку на массив
      idsArray = ids.split(',').map((id) => parseInt(id.trim(), 10));
    } else {
      // Если ids является числом, добавляем его в массив
      idsArray.push(parseInt(ids, 10));
    }

    // полн.удал.Файла е/и нет userId
    if (!userId && !param) {
      return await this.filesRepository.delete(ids);
    }

    // `созд.строит.req` > `мягк.удал.`ф.
    const sotDelFiles = this.filesRepository
      .createQueryBuilder('files')
      .withDeleted()
      .where('id IN (:...ids) AND user = :userId', {
        ids: idsArray,
        userId: userId,
      });

    // при парам.сразу удал.
    if (param) {
      return await sotDelFiles.softDelete().execute();
    }
    // ^^ удал.данн.др.табл.
  }

  // Проверка наличия типа файла в базе данных
  async fileTypeExists(fileType: string): Promise<boolean> {
    console.log('fileType : ' + fileType);
    // проверяем в БД наличие типа файла
    const result = await this.filesRepository.findOne({
      where: { target: ILike(`%${fileType}%`) },
    });
    console.log('result : ', result);
    return !!result;
  }
}
