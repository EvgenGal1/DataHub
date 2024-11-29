import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, In, Repository } from 'typeorm';

// Сущности/DTO
import { FileEntity } from './entities/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
import { TrackEntity } from '../tracks/entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
// утилиты Общие
import { BasicUtils } from '../../common/utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// типы/пути файлов
import { FilePaths } from '../../common/types/typeFilePaths';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';
// константы > команды запуска process.env.NODE_ENV
import { isProduction, isDevelopment } from '../../config/envs/env.consts';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(
    // ч/з внедр.завис. + TrackEntity,ReactionEntity,UserEntity > раб.ч/з this с табл.track,reaction,user
    // логи
    private readonly logger: LoggingWinston,
    // ^ подкл.БД от NODE_ENV. PROD(SB) <> DEV(LH)
    @InjectRepository(UserEntity, isProduction ? 'supabase' : 'localhost')
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(FileEntity, isProduction ? 'supabase' : 'localhost')
    private filesRepository: Repository<FileEntity>,
    @InjectRepository(TrackEntity, isProduction ? 'supabase' : 'localhost')
    private tracksRepository: Repository<TrackEntity>,
    @InjectRepository(AlbumEntity, isProduction ? 'supabase' : 'localhost')
    private albumsRepository: Repository<AlbumEntity>,
    @InjectRepository(ReactionEntity, isProduction ? 'supabase' : 'localhost')
    private reactionsRepository: Repository<ReactionEntity>,
    // ^ доп.репозит.настр.
    private basicUtils: BasicUtils,
    private dataBaseUtils: DatabaseUtils,
  ) {}

  async createFileByParam(
    file: Express.Multer.File,
    userId: number,
    filePaths?: FilePaths | null,
  ): Promise<FileEntity> {
    let savedFile: FileEntity | null = null;
    try {
      // `получить наименьший доступный идентификатор` из БД > табл.file
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('file');

      // ^^ настроить паралел.сохр.с тип audio > сохр.в track через serv.track

      // Имя по Unicode
      // const isValidUtf8 = /^[\x00-\x7F\xC2-\xFD]+$/;
      // const regExStandard = /^[а-яА-Яa-zA-Z0-9\s]+$/u;
      if (!/^[а-яА-Яa-zA-Z0-9\s]+$/u.test(file.originalname))
        file.originalname = decodeURIComponent(escape(file.originalname));

      if (file.path.indexOf(process.env.LH_PUB_DIR)) {
        // передача относит.пути
        /* const pathresult =  */ file.path = file.path
          .replace(/\\/g, '/')
          .split(`${process.env.LH_PUB_DIR}/`)[1];
        // console.log('pathresult : ', pathresult);
      }

      // объ.files
      const files = {
        id: smallestFreeId,
        fileName: file.filename,
        // originalname: file.originalname,
        mimeType: file.mimetype,
        path: file.path,
        size: file.size,
        user: { id: userId },
      };

      // созд.объ.сохр.
      const fileCre = this.filesRepository.create(files);
      // проверка/лог
      if (!fileCre) {
        this.logger.error(`File '${file.filename}' не создан`);
        throw new NotFoundException(`File '${file.filename}' не создан`);
      }
      // log > DEV
      if (isDevelopment) this.logger.info(`db + File : '${file.filename}'`);

      // сохр./ошб./лог./возврат
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
        // удален.записи табл. // ! мб.ошб.т.к нет ID
        // if (savedFile && savedFile.id) await this.removeFile(savedFile.id);
        // удален.ч/з отдел.fn
        await this.removeFileFromStorage(file.path);
      }

      this.logger.error(
        `!Ошб. + File: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `fil.s. CRE : file '${file.filename}' с filePaths '${filePaths}'`,
        );
      throw error;
    }
  }

  // мтд.получ.ф. Все/Тип. // возвращ.ф.опред.user и с опред.типом(декор.Query)
  async findAllFiles(
    paramTargetValue: Record<string, string>, // Построить тип с набором свойств k типа T
    count: number = 25,
    offset: number = 0,
    filePathsArray?: FilePaths[],
  ): Promise<FileEntity[]> {
    try {
      // без парам.вернуть всё
      if (
        Object.keys(paramTargetValue).length === 0 && // парам.нет
        // Object.values(paramTargetValue).every((value) => !value) && // парам.нет > кажд.знач.
        (filePathsArray.length === 0 ||
          filePathsArray.includes(FilePaths.ALL)) && // путей нет
        // userId === 1 &&
        count === 25 &&
        offset === 0
      ) {
        return this.filesRepository.find();
      }

      const queryBuilder = this.filesRepository.createQueryBuilder('file');

      // Параметры
      if (paramTargetValue && Object.keys(paramTargetValue).length > 0) {
        const [key, value] = Object.entries(paramTargetValue)[0];
        // учёт типа поля столбца (у integer нет LIKE)
        if (key === 'user' || key === 'size') {
          queryBuilder.andWhere(`file.${key} = :value`, {
            value,
          });
        } else {
          queryBuilder.andWhere(`file.${key} ILIKE :value`, {
            value: `%${value}%`,
          });
        }
      }

      // Пути
      if (filePathsArray && filePathsArray.length > 0) {
        const conditions = filePathsArray.map((path, index) => {
          return `file.path = :path${index}`;
        });

        queryBuilder.andWhere(
          // груп.вызывов andWhere ()
          `(${conditions.join(' OR ')})`,
          filePathsArray.reduce((params, path, index) => {
            params[`path${index}`] = `${path}/`;
            return params;
          }, {}),
        );
      }

      // Пользователь
      // if (userId !== 1) {
      //   queryBuilder.andWhere('file.userId = :userId', { userId });
      // }

      // Добавляем пагинацию
      if (count) {
        queryBuilder.take(count);
      }
      if (offset) {
        queryBuilder.skip(offset);
      }

      this.logger.log(`Executing query: ${queryBuilder.getSql()}`);

      return queryBuilder.getMany();
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
      if (isDevelopment) this.logger.info(`db # File '${file.fileName}'`);

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

  // удаления файла из хранилища
  private async removeFileFromStorage(filePath: string) {
    const fs = require('fs').promises;
    try {
      await fs.unlink(filePath);
      this.logger.info(`Файл '${filePath}' успешно удален из хранилища.`);
    } catch (error) {
      this.logger.error(
        `Ошибка удаления файла '${filePath}': ${error /* ?.message */}`,
      );
    }
  }

  // пометка Удаления
  // ^ перенести логику в deleteFile (заменить в file.c, albums.s ,tracks.s)
  async removeFile(ids: number | string, userId?: number, param?: string) {
    try {
      if (isDevelopment) this.logger.info(`db - File.ID: '${ids}'`);
      // ошб.е/и нет ID
      if (!ids) {
        this.logger.error('Нет Файла/ов > Удаления');
        throw new NotFoundException('Нет Файла/ов > Удаления');
      }

      // превращ.ids ф.в масс.
      let idsArray: number[] = [];
      // Проверяем, является ли ids строкой
      if (typeof ids === 'string') {
        // Если ids является строкой, разбиваем строку на массив
        idsArray = ids.split(',').map((id) => parseInt(id.trim(), 10));
      } else if (typeof ids === 'number') {
        // Если ids является числом, добавляем его в массив
        idsArray.push(ids);
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

  //  ----------------------------------------------------------------------------------
  async deleteFiles(
    ids: number[],
    userId: number,
    hardDelete: boolean = false,
  ): Promise</* any */ /* DeleteResult */ {
    deleted: number[];
    notDeleted: { id: number; reason: string }[];
  }> {
    if (isDevelopment)
      this.logger.info(
        `db - Files.IDs '${ids}' ${hardDelete ? 'HardDel' : ''} от User.ID '${userId}'`,
      );

    // файл со связями
    const files = await this.filesRepository.find({
      where: { id: In(ids) },
      relations: [
        'userAvatar',
        'track',
        'tracksCover',
        'albumsCover',
        'reactions',
        'track.albums',
        'track.reactions',
        'track.coverArt',
        'tracksCover.albums',
        'tracksCover.reactions',
        'tracksCover.coverArt',
        'albumsCover.tracks',
        'albumsCover.reactions',
        'albumsCover.coverArt',
      ],
    });

    if (files.length !== ids.length || !files) {
      // уник.IDs
      const uniqueIds = Array.from(new Set(ids));
      // фильтр.уник.IDs по files ч/з some в `отсутствующий IDs`
      const missingIds = uniqueIds.filter(
        (id) => !files.some((file) => file.id === id),
      );
      this.logger.warn(`File IDs '${missingIds.join(', ')}' не найдены`);
      throw new NotFoundException(
        `Files.IDs '${missingIds.join(', ')}' не найдены`,
      );
    }

    const deletedFiles: number[] = [];
    const notDeletedFiles: { id: number; reason: string }[] = [];

    // Проверка и удаление связанных сущностей
    for (const file of files) {
      // Мягкое удаление связанных сущностей
      if (file.userAvatar) {
        for (const user of file.userAvatar) {
          if (user.deletedAt !== null) {
            user.coverArt = null;
            await this.usersRepository.save(user); // * - AVA   НЕ ПРОВЕРЕНО
          }
        }
      }
      if (file.track) {
        // ^ много обработки - после удаления Трека проверить остались ли Треки в Альбоме, пересчитать общие данные (author genres total_tracks total_duration)
        await this.softDeleteTrack(file.track, notDeletedFiles);
      }
      if (file.tracksCover) {
        for (const track of file.tracksCover) {
          // await this.tracksRepository.save(track);
          // ^ скорее пометка track.coverArt = null   И   проверка передан ли ID для удал.   И   проверка есть ли связка файла и др.Сущностями (удаление е/и нет)
          // await this.softDeleteTrack(track);
          if (track.deletedAt !== null) {
            track.coverArt = null;
            await this.tracksRepository.save(track); // * ~ tc.9,10  T.coverArt = null
          }
        }
      }
      if (file.albumsCover) {
        for (const album of file.albumsCover) {
          // await this.albumsRepository.save(album);
          // ^ скорее пометка album.coverArt = null   И   проверка передан ли ID для удал.   И   проверка есть ли связка файла и др.Сущностями (удаление е/и нет)
          // await this.softDeleteAlbum(album);
          if (album.deletedAt !== null) {
            album.coverArt = null;
            await this.albumsRepository.save(album); // * - ac.5,6  A.coverArt = null
          }
        }
      }

      // Удаление реакций
      if (file.reactions) {
        for (const reaction of file.reactions) {
          await this.reactionsRepository./* delete */ softDelete({
            file: file,
          }); // * - rf.8,9, rf.16
        }
      }

      // Удаление файла с диска // ** - ФАЙЛ при hardDelete
      if (hardDelete) {
        const filePath = path.resolve(file.path);
        // await this.removeFileFromStorage(file.path); // ^ мтд.
        if (fs.existsSync(filePath)) {
          // fs.unlinkSync(filePath);
        }
      }

      // проверяется, используется ли файл в других треках, альбомах или как обложка треков. Если используется, файл не удаляется, и добавляется информация о причине в notDeletedFiles.
      if (await this.canDeleteFile(file, notDeletedFiles)) {
        // Полное удаление файлов из хранилища и базы данных
        if (hardDelete) {
          await this.filesRepository.delete({ id: In(ids) });
        }
        // Мягкое удаление файлов
        else {
          await this.filesRepository.softDelete({ id: In(ids) }); // * - f.13, f.14
        }
        deletedFiles.push(file.id);
      }
    }
    return { deleted: deletedFiles, notDeleted: notDeletedFiles };
  }

  private async softDeleteTrack(
    track: TrackEntity,
    notDeletedFiles: { id: number; reason: string }[],
  ): Promise<void> {
    // ** f.13, rf.8,9, t.9(a.5, cAr.14, rt.10,11)
    if (track.reactions) {
      for (const reaction of track.reactions) {
        await this.reactionsRepository.softDelete(reaction.id); // * - rt.10,11
      }
    }
    if (track.coverArt) {
      // Проверяем, сколько раз используется обложка
      const coverArtUsageTracks = await this.tracksRepository.find({
        where: { coverArt: { id: track.coverArt.id } },
      });
      const coverArtUsageAlbums = await this.albumsRepository.find({
        where: { coverArt: { id: track.coverArt.id } },
      });
      const coverArtUsage = [...coverArtUsageTracks, ...coverArtUsageAlbums];

      if (coverArtUsage.length === 1) {
        await this.filesRepository.softDelete(track.coverArt.id); // * - cAr.14
      } else {
        track.coverArt = null;
        // ~ может не нужно удалять связку с обложкой если обложка не удаляется
        await this.tracksRepository.save(track); // * ~ cAr.14  T.coverArt = null
      }
    }
    for (const album of track.albums) {
      console.log('album -- : ', album);
      album.total_tracks--;
      album.total_duration = (
        parseInt(album.total_duration) - track.duration
      ).toString();

      // ~ если кол-во или продолж. = 0 то трек удал. + Проверка обложки
      await this.albumsRepository.save(album); // * ~ a.5 для +1го есть   НУЖНО ОБРАБОТАТЬ 0
      if (album.total_tracks === 0 || album.total_duration === '0') {
        await this.softDeleteAlbum(album);
      } else {
        await this.albumsRepository.save(album);
      }
    }

    // ^ сперва проверка принадлежности трека к др.связкам (трек в др.альбоме)
    // принадлежит ли трек к другим альбомам. Если принадлежит, трек не удаляется, и добавляется информация о причине в notDeletedFiles.
    if (await this.canDeleteTrack(track, notDeletedFiles)) {
      await this.tracksRepository.softDelete(track.id); // * - t.9
    }
  }

  private async softDeleteAlbum(album: AlbumEntity): Promise<void> {
    if (album.reactions) {
      for (const reaction of album.reactions) {
        await this.reactionsRepository.softDelete(reaction.id);
      }
    }

    if (album.coverArt) {
      const coverArtUsageTracks = await this.tracksRepository.find({
        where: { coverArt: { id: album.coverArt.id } },
      });
      const coverArtUsageAlbums = await this.albumsRepository.find({
        where: { coverArt: { id: album.coverArt.id } },
      });
      const coverArtUsage = [...coverArtUsageTracks, ...coverArtUsageAlbums];

      if (coverArtUsage.length === 1) {
        await this.filesRepository.softDelete(album.coverArt.id);
      } else {
        album.coverArt = null;
        await this.albumsRepository.save(album);
      }
    }

    await this.albumsRepository.softDelete(album.id);
  }

  private async canDeleteFile(
    file: FileEntity,
    notDeletedFiles: { id: number; reason: string }[],
  ): Promise<boolean> {
    const trackUsage = await this.tracksRepository.find({
      where: { file: file },
    });
    const albumUsage = await this.albumsRepository.find({
      where: { coverArt: file },
    });
    const trackCoverUsage = await this.tracksRepository.find({
      where: { coverArt: file },
    });

    if (trackUsage.length > 0) {
      notDeletedFiles.push({ id: file.id, reason: 'Используется в треках' });
      return false;
    }

    if (albumUsage.length > 0) {
      notDeletedFiles.push({ id: file.id, reason: 'Используется в альбомах' });
      return false;
    }

    if (trackCoverUsage.length > 0) {
      notDeletedFiles.push({
        id: file.id,
        reason: 'Используется как обложка треков',
      });
      return false;
    }

    return true;
  }

  private async canDeleteTrack(
    track: TrackEntity,
    notDeletedFiles: { id: number; reason: string }[],
  ): Promise<boolean> {
    const albumUsage = await this.albumsRepository.find({
      where: { tracks: track },
    });

    if (albumUsage.length > 0) {
      notDeletedFiles.push({ id: track.id, reason: 'Используется в альбомах' });
      return false;
    }

    return true;
  }

  //  ----------------------------------------------------------------------------------

  // Проверка наличия типа файла в базе данных
  async fileTypeExists(filePaths: string): Promise<boolean> {
    if (isDevelopment) this.logger.info(`db <? filePaths '${filePaths}'`);
    // проверяем в БД наличие типа файла
    const result = await this.filesRepository.findOne({
      where: { path: ILike(`%${filePaths}%`) },
    });
    this.logger.info(`<? filePaths '${filePaths}'`);
    return !!result;
  }

  // ПОЛУЧИТЬ РЕАКЦИЮ
  async getFileWithReactions(fileId: number): Promise<FileEntity> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
      relations: ['usersAsAvatar', 'user', 'albums'],
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found.`);
    }

    return file;
  }
}
