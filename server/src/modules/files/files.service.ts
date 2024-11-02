import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { FileType, FileEntity, fileTypesAllowed } from './entities/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
// утилиты Общие
import { BasicUtils } from '../../common/utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';
// константы > команды запуска process.env.NODE_ENV
import { isProduction, isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class FilesService {
  constructor(
    // логи
    private readonly logger: LoggingWinston,
    // ^ подкл.БД от NODE_ENV. PROD(SB) <> DEV(LH)
    @InjectRepository(FileEntity, isProduction ? 'supabase' : 'localhost')
    private filesRepository: Repository<FileEntity>,
    // ^ доп.репозит.настр.
    private basicUtils: BasicUtils,
    private dataBaseUtils: DatabaseUtils,
  ) {}

  async createFileByParam(
    file: Express.Multer.File,
    userId: number,
    fileType?: FileType | null,
  ): Promise<FileEntity> {
    let savedFile;
    try {
      // `получить наименьший доступный идентификатор` из БД > табл.file
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('file');

      // ^^ настроить паралел.сохр.с тип audio > сохр.в track через serv.track

      // проверка на Unicode
      const isValidUtf8 = /^[\x00-\x7F\xC2-\xFD]+$/;

      // объ.files
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

      const fileCre = this.filesRepository.create(files);
      if (!fileCre) {
        this.logger.error(`File '${file.filename}' не создан`);
        throw new NotFoundException(`File '${file.filename}' не создан`);
      }

      // log > DEV
      if (isDevelopment) this.logger.info(`db + File : '${file.filename}'`);
      savedFile = await this.filesRepository.save(files);
      if (!savedFile) {
        this.logger.error(`File '${file.filename}' не сохранён`);
        throw new NotFoundException(`File '${file.filename}' не сохранён`);
      }
      this.logger.info(`+ File.ID '${savedFile.id}'`);
      return savedFile;
    } catch (error) {
      // удал.записи табл./ф. при неудачн.загр.
      if (!savedFile) {
        this.logger.error(
          `Ошб.! File '${file.filename}' удаляется из п.public`,
        );
        // удален.ф.с локал.хран.
        // fs.promises
        //   .unlink(deleteFile.path)
        //   .catch((error) => console.error(`Ошибка удаления файла: ${error}`));
        // удален.записи табл.
        await this.removeFile(savedFile.id);
      }

      this.logger.error(
        `!Ошб. + File: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `fil.s. CRE : file '${file.filename}' с fileType '${fileType}'`,
        );
      throw error;
    }
  }

  // мтд.получ.ф. Все/Тип. // возвращ.ф.опред.user и с опред.типом(декор.Query)
  async findAllFiles(
    userId: number,
    fileTypes?: any /* FileType | FileType[] */,
  ): Promise<FileEntity[]> {
    try {
      // `допустимые типы`. Сравнение входа(fileTypes) с `разрешенными типами ф.`(fileTypesAllowed)
      const validTypes = fileTypes.filter((type: string) =>
        fileTypesAllowed.includes(type.toLowerCase()),
      );

      // проверка на `неверные типы`. Е/и разные типы вход/разрешен.(fileTypes/fileTypesAllowed) и нужен ответ о не разрешённых
      // const invalidTypes = fileTypes.filter((type) => !validTypes.includes(type));
      // if (invalidTypes.length > 0) {return `Тип(ы) файла ${invalidTypes.join(', ',)} отсутствует в базе данных.`;}

      // генер.спец.SQL req > "создать строитель запросов" > id user
      const qb = this.filesRepository
        .createQueryBuilder('file')
        .where('file.userId = :userId', { userId });

      // Если переданы все типы файлов или не указано значение, возвращаем все файлы
      // ! Аргумент типа ""all"" нельзя назначить параметру типа "FileType" (вход.props)
      const all = validTypes.includes('all') || validTypes.length === 0;

      // возврат ВСЕГО
      if (all && isDevelopment) this.logger.info(`db << Files 'All'`);

      // составн.req > `допустимые типы`
      if (!all && isDevelopment) {
        this.logger.info(`db << Files 'ILIKE' '${validTypes.join(', ')}'`);
        qb.andWhere('file.target ILIKE ANY(:types)', {
          types: validTypes.map((type) => `%${type}%`),
        });
      }

      // кол-во записей
      const count = await qb.getCount();
      this.logger.info(
        `<< Files ${all ? `'ALL'` : `'ILIKE' '${validTypes.join(', ')}'`} count '${count}' < БД '${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}'`,
      );
      return await qb.getMany();
    } catch (error) {
      this.logger.error(
        `!Ошб. << Files: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ОДИН по id
  async findOneFile(id: number): Promise<FileEntity> {
    try {
      if (isDevelopment) this.logger.info(`db < File.ID '${id}'`);
      const file = await this.filesRepository.findOneBy({ id });
      if (!file) {
        this.logger.error(`File.ID '${id}' не найден`);
        throw new NotFoundException(`File.ID '${id}' не найден`);
      }
      this.logger.info(`< User.ID '${file?.id}'`);
      return file;
    } catch (error) {
      this.logger.error(
        `!Ошб. < File.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // мтд.обновить
  async updateFile(
    id: number,
    updateFileDto: UpdateFileDto,
  ): Promise<FileEntity> {
    try {
      const file = await this.filesRepository.findOneBy({ id });
      if (!file) {
        this.logger.error(`File.ID '${id}' не найден`);
        throw new NotFoundException(`File.ID '${id}' не найден`);
      }

      // изменения
      // await this.filesRepository.update(id, updateFileDto);
      Object.assign(file, updateFileDto);

      // log > DEV
      if (isDevelopment) this.logger.info(`db # File '${file.filename}'`);

      const filUpd = await this.filesRepository.save(file);
      if (!filUpd) {
        this.logger.error(
          `File.ID '${id}' по DTO '${JSON.stringify(updateFileDto)}' не обновлён`,
        );
        throw new NotFoundException(
          `File.ID '${id}' по DTO '${JSON.stringify(updateFileDto)}' не обновлён`,
        );
      }
      this.logger.info(`# File.ID : '${filUpd.id}'`);
      return filUpd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # File: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `fil.s. UPD : File.ID '${id}' | DTO '${JSON.stringify(updateFileDto)}`,
        );
      throw error;
    }
  }

  // пометка Удаления
  // ^ перенести логику в deleteFile (заменить в file.c, albums.s ,tracks.s)
  async removeFile(
    ids: any /* number | string */,
    userId?: number,
    param?: string,
  ) {
    try {
      if (isDevelopment) this.logger.info(`db - File.ID: '${ids}'`);
      // ошб.е/и нет ID
      if (!ids) {
        this.logger.error('Нет Файла/ов > Удаления');
        throw new NotFoundException('Нет Файла/ов > Удаления');
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
        this.logger.info(`-- File.ID : '${ids}'`);
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

      // при парам.сразу мягк.удал.
      if (param === `del`) {
        this.logger.info(`- File.ID : '${ids}'`);
        return await sotDelFiles.softDelete().execute();
      }
      // ^^ удал.данн.др.табл.
    } catch (error) {
      this.logger.error(
        `!Ошб. - File.ID '${ids}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // востановить
  // async restoreFile(id: number|string) {
  //   return await this.filesRepository.restore(id);
  // }

  // Удаление Полное
  // ^ перенести логику из removeFile (заменить в file.c, albums.s ,tracks.s)
  async deleteFile(
    userIds: string | number,
    userId?: number,
    // totalUserDto?: TotalUserDto,
    param?: string,
  ) {
    try {
      // ошб.е/и нет ID
      if (!userIds) {
        this.logger.error('Нет Файла/ов > Удаления');
        throw new NotFoundException('Нет Файла/ов > Удаления');
      }
      if (!userId && !param /* && !totalUserDto */) {
        this.logger.error('Предовращено полное удаление Файла/ов');
        throw new NotFoundException('Предовращено полное удаление Файла/ов');
      }
    } catch (error) {
      this.logger.error(
        `!Ошб. - User.ID '${userIds}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // Проверка наличия типа файла в базе данных
  async fileTypeExists(fileType: string): Promise<boolean> {
    if (isDevelopment) this.logger.info(`db <? fileType '${fileType}'`);
    // проверяем в БД наличие типа файла
    const result = await this.filesRepository.findOne({
      where: { target: ILike(`%${fileType}%`) },
    });
    this.logger.info(`<? fileType '${fileType}'`);
    return !!result;
  }
}
