/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, ObjectId } from 'typeorm';
import { Logger } from 'winston';
import * as fs from 'fs';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateAlbumDto } from '../albums/dto/create-album.dto';
import { TrackEntity } from './entities/track.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ReactionEntity } from '../reactions/entities/reaction.entity';
import { CreateReactionDto } from '../reactions/dto/create-reaction.dto';
import { AlbumsService } from '../albums/albums.service';
import { FilesService } from '../files/files.service';
import { FileEntity } from '../files/entities/file.entity';
// утилиты Общие
import { BasicUtils } from '../../common/utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../../common/envs/env.consts';

@Injectable()
export class TracksService {
  constructor(
    // логи
    @Inject('WINSTON_LOGGER') private readonly logger: Logger,
    // ч/з внедр.завис. + TrackEntity,ReactionEntity,UserEntity > раб.ч/з this с табл.track,reaction,user
    // ^ подкл.неск.БД.
    // ^ репозитории только > БД SupaBase(SB)
    @Optional()
    @InjectRepository(TrackEntity, 'supabase')
    private tracksRepositorySB: Repository<TrackEntity>,
    @Optional()
    @InjectRepository(ReactionEntity, 'supabase')
    private reactionsRepositorySB: Repository<ReactionEntity>,
    @Optional()
    @InjectRepository(UserEntity, 'supabase')
    private usersRepositorySB: Repository<UserEntity>,
    @Optional()
    @InjectRepository(FileEntity, 'supabase')
    private filesRepositorySB: Repository<FileEntity>,
    @Optional()
    @InjectRepository(AlbumEntity, 'supabase')
    private albumsRepositorySB: Repository<AlbumEntity>,
    // ^ общ.репозит.настр.
    private filesService: FilesService,
    private albumsService: AlbumsService,
    private dataBaseUtils: DatabaseUtils,
    private basicUtils: BasicUtils,
    // ^ доп.необязат.репозит(Optional) > БД LocalHost(LH)
    @Optional()
    @InjectRepository(TrackEntity, 'localhost')
    private tracksRepository?: Repository<TrackEntity>,
    @Optional()
    @InjectRepository(ReactionEntity, 'localhost')
    private reactionsRepository?: Repository<ReactionEntity>,
    @Optional()
    @InjectRepository(UserEntity, 'localhost')
    private usersRepository?: Repository<UserEntity>,
    @Optional()
    @InjectRepository(FileEntity, 'localhost')
    private filesRepository?: Repository<FileEntity>,
    @Optional()
    @InjectRepository(AlbumEntity, 'localhost')
    private albumsRepository?: Repository<AlbumEntity>,
  ) {}

  // СОЗД.Трек. Req - track(аудио + обложка),UserId,CreateTrackDto(трек,артист,текст,стиль); Res - TrackEntity в `Обещание`
  async createTrackByParam(
    audios: Record<string, Express.Multer.File[]> | any,
    userId: number,
    createTrackDto?: CreateTrackDto | null,
  ) /* : Promise<TrackEntity> */ {
    console.log(
      't.s. audios | userId | DTO: ',
      audios,
      '|',
      userId,
      '|',
      createTrackDto,
    );
    // логи,перем.ошб.
    this.logger.info(
      `Запись Audio в БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `Audio не сохранён в БД`;
    // перем.сохр. Track File Album
    let savedFile,
      savedTrack,
      savedAlbum,
      savedCover = null;
    try {
      // ошб.е/и нет Трека
      if (!audios) {
        throw new NotFoundException('Трек не передан для БД');
      }
      if (!audios?.track) {
        throw new NotFoundException('Нет Трека > Записи');
      }

      // перебор всех audios.track
      for (const audioObj of audios?.track) {
        // `получить аудио метаданные`
        const audioMetaData = await this.basicUtils.getAudioMetaData(audioObj);
        // проверка `существующий Трек` с учётом deletedAt по title origName
        const existingTrack = await this.tracksRepository
          .createQueryBuilder('tracks')
          .withDeleted()
          .where('name = :title OR name = :originalname', {
            title: audioMetaData.title,
            originalname: audioMetaData.originalname,
          })
          .getOne();
        // перем.проверки стар./нов. Трека
        const deletedAtExist = existingTrack?.deletedAt;
        // ошб. > Трек есть
        if (existingTrack?.deletedAt === null) {
          throw new NotFoundException('Трек уже есть в БД');
        }
        // Трек есть > очистка мягк.удал. Запись внизу после всех
        if (existingTrack?.id) {
          // очистка мягк.удал.
          existingTrack?.deletedAt != null
            ? await this.tracksRepository.save({
                id: existingTrack?.id,
                deletedAt: (existingTrack.deletedAt = null),
              })
            : '';
        }

        // ФАЙЛ (табл.всех Files).
        let existingFile;
        // ф.Трека(name,artist,text,genre) + savedFile(dto=obj<>num)
        if (
          typeof createTrackDto === 'object' ||
          createTrackDto === (null || undefined)
        ) {
          // приведение к типу JSON обратно из строки odj<>str createTrackDto после track.cntrl.ApiBody.schema
          // trackDto = JSON.parse(createTrackDto['createTrackDto']);
          // проверка `существующий Файл` по имени с учётом deletedAt
          existingFile = await this.filesRepository
            .createQueryBuilder('files')
            .withDeleted()
            .where({ filename: audioMetaData.originalname })
            .getOne();
          //  мягк.удал. <> сохр.Трек
          if (existingFile?.id) {
            // присвойка существ.объ.
            savedFile = existingFile;
            // очистка мягк.удал.
            existingFile?.deletedAt != null
              ? await this.filesRepository.save({
                  id: existingFile?.id,
                  deletedAt: (existingFile.deletedAt = null),
                })
              : '';
          } else {
            // подмена пути ф. е/и загр.вместе с треком
            audioObj.destination = '/audios/track/';
            // имя из ttle или назв.
            audioObj.filename = audioMetaData.title
              ? audioMetaData.title
              : audioMetaData.originalname;
            savedFile = await this.filesService.createFileByParam(
              audioObj,
              userId,
            );
          }
        }
        // ? для чего. createTrackByParam либо есть либо нет
        else {
          savedFile = createTrackDto ? createTrackDto : null;
        }

        // COVER (обложка > табл.всех Files).
        if (audios?.cover && audios?.cover.length > 0 && audios?.track) {
          // проверка `существующий Обложки` по имени
          const existingCover = await this.filesRepository
            .createQueryBuilder('files')
            .withDeleted()
            .where({ filename: audios.cover[0].filename })
            .getOne();
          // обнов. <> сохр. Обложку
          if (existingCover?.id) {
            // присвойка существ.объ.
            savedCover = existingCover;
            // очистка мягк.удал.
            existingCover?.deletedAt != null
              ? await this.filesRepository.save({
                  id: existingCover.id,
                  deletedAt: (existingCover.deletedAt = null),
                })
              : '';
          } else {
            // подмена пути ф. е/и загр.вместе с треком
            audios.cover[0].destination = '/images/album/';
            // перекод.имя
            audios.cover[0].filename =
              await this.basicUtils.decodeIntoKeyAndValue(
                'filename',
                audios.cover[0].originalname,
              );
            // сохр.обложку Files
            savedCover = await this.filesService.createFileByParam(
              audios.cover[0],
              userId,
            );
          }
        }

        // АЛЬБОМ (табл.Albums). есть ф.Обложки <> метаданн.Альбома
        if (audios?.cover?.length > 0 || audioMetaData.album) {
          // проверка `существующий Альбом` по заголовку с учётом deletedAt
          // const existingAlbum = await this.albumsRepository.findOne({ where: { title: audioMetaData.album }, withDeleted: true, relations: ['cover'], }); // ! ошб. выгр.1 при audioMetaData.album = undf
          const existingAlbum = await this.albumsRepository
            .createQueryBuilder('albums')
            .where({ title: audioMetaData.albums })
            .leftJoinAndSelect('albums.cover', 'cover')
            .withDeleted()
            .getOne();
          // основ.данн.Альбома
          const basicAlbumData = {
            title: existingAlbum?.title || audioMetaData.album,
            author: existingAlbum?.author || audioMetaData.artist,
            year: existingAlbum?.year || audioMetaData.year,
            genres: existingAlbum?.genres || audioMetaData.genre,
            path:
              // стар.,нов.,нет
              existingAlbum?.path ||
              savedCover?.target + savedCover?.filename ||
              '',
            cover: existingAlbum?.cover || savedCover?.id,
          };
          // доп.данн.Альбома
          const totalAlbumData = {
            total_duration: audioMetaData.duration,
            total_tracks: audios.track.length,
          };

          // обнов.существующий Альбом
          if (existingAlbum?.id) {
            // присвойка существ.объ.
            savedAlbum = existingAlbum;
            // очистка мягк.удал.Альбома
            if (existingAlbum?.deletedAt != null) {
              await this.albumsRepository.save({
                id: existingAlbum.id,
                deletedAt: (existingAlbum.deletedAt = null),
              });
            }
            // очистка мягк.удал.Обложки
            if (existingAlbum?.cover?.deletedAt != null) {
              await this.filesRepository.save({
                id: existingAlbum?.cover?.id,
                deletedAt: (existingAlbum.cover.deletedAt = null),
              });
            }
            // перем.обнов.Альбома
            const updateAlbum = await this.albumsService.updateAlbum(
              savedAlbum.id,
              basicAlbumData,
              totalAlbumData,
              'add',
            );

            // есть Track и File в БД
            if (existingTrack?.id && existingFile?.id) {
              // req проверки наличия Трека в Альбоме
              const trackExistsInAlbum = await this.tracksRepository
                .createQueryBuilder('tracks')
                .leftJoinAndSelect('tracks.album', 'album')
                .withDeleted()
                .where('tracks.name = :trackName', {
                  trackName: audioMetaData.title,
                })
                .andWhere('album.title = :albumName', {
                  albumName: audioMetaData.album,
                })
                .getOne();

              // Трека нет в Альбоме
              if (!trackExistsInAlbum) updateAlbum;
              // Трек есть и мягк.удалён
              else if (trackExistsInAlbum && deletedAtExist != null)
                updateAlbum;
            }
            // нет Трека/Файла в БД
            else if (!(existingTrack?.id && existingFile?.id)) updateAlbum;
          }
          // созд.нов.Альбом
          else {
            savedAlbum = await this.albumsService.createAlbum(
              basicAlbumData,
              userId,
              savedCover?.id || null,
              totalAlbumData,
            );
          }
        }

        // ТРЕК (табл.Audios)
        // trackID. `получить наименьший доступный идентификатор` из БД > табл.track
        const smallestFreeId =
          await this.dataBaseUtils.getSmallestIDAvailable('track');
        // обнов.основ.данн.Трека из MetaData иначе существ.Трек или DTO+
        const trackDto =
          createTrackDto instanceof CreateTrackDto
            ? createTrackDto
            : new CreateTrackDto();
        const basicTrackData = {
          ...trackDto,
          name: trackDto.name.includes('#')
            ? audioMetaData?.title ?? `${trackDto?.name}_${smallestFreeId}`
            : existingTrack?.name ?? `${trackDto?.name}_${smallestFreeId}`,
          genre: trackDto.genre.includes('#')
            ? audioMetaData?.genre ?? `${trackDto?.genre}_${smallestFreeId}`
            : existingTrack?.genre ?? `${trackDto?.genre}_${smallestFreeId}`,
          artist: trackDto.artist.includes('#')
            ? audioMetaData?.artist ?? `${trackDto?.artist}_${smallestFreeId}`
            : existingTrack?.artist ?? `${trackDto?.artist}_${smallestFreeId}`,
        };
        // объ.track созд./сохр./вернуть
        const track = /* this.tracksRepository.create( */ {
          ...basicTrackData,
          id: existingTrack?.id || smallestFreeId,
          path:
            existingTrack?.path ||
            savedFile?.target + savedFile?.filename ||
            audioObj?.path,
          listens: existingTrack?.listens || 0,
          duration: audioMetaData?.duration || 0,
          file: savedFile?.id || null,
          album: savedAlbum?.id || null,
          cover: savedCover?.id || savedAlbum?.cover || null,
          user: { id: userId },
          // sampleRate: audioMetaData.sampleRate, // частота дискретизации
          // bitrate: audioMetaData.bitrate:,
          // year: audioMetaData.year:,
          reactions: null,
        }; /* ) */

        console.log('T.s. CRE track : ', track);
        savedTrack = await this.tracksRepository.save(track);

        // ^^ РАЗДЕЛ.ф.,настр. Внедрен.репозит.в зависим.от БД (е/и табл.на разн.БД)
        // await this.localTracksRepository.save(track);
        // if (process.env.NODE_ENV === 'production') {
        //   await this.supabaseTracksRepository.save(track);
        // }

        return savedTrack;
      }
    } catch (error) {
      console.log('t.s. catch error : ', error);
      // опред.загр.данн.в табл. и удал.записи табл./ф. при неудачн.загр.
      if (!savedTrack || !savedFile || !savedAlbum) {
        if (savedTrack) {
          // удален.ф.с локал.хран.
          // fs.promises
          //   .unlink(savedTrack.path)
          //   .catch((error) => console.error(`Ошибка удаления файла: ${error}`));
          // удален.записи табл.
          await this.deleteTrack(savedTrack.id);
        }
        if (savedFile) {
          // удален.ф.с локал.хран.
          // fs.promises
          //   .unlink(savedFile.target + savedFile.filename)
          //   .catch((error) => console.error(`Ошибка удаления файла: ${error}`));
          // удален.записи табл.
          await this.filesService.removeFile(savedFile.id);
        }
        if (savedAlbum) {
          await this.albumsService.deleteAlbum(savedAlbum.id);
        }
        throw new NotFoundException('Ошибка сохранения данных в БД', error);
      }
    }
  }

  // ВСЕ треки. Req - "", Res - масс.TrackEntity в `Обещание`
  async findAllTracks(
    param: string | number,
    count = 10,
    offset = 0,
  ): Promise<TrackEntity[]> {
    console.log('fAl t.s. fAl param count offset: ', param, count, offset);
    // логи,перем.ошб.
    this.logger.info(
      `Получение всех Audios из БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `Audios нет в БД`;
    // без парам.вернуть всё
    if (!param && count === 10 && offset === 0) {
      return this.tracksRepository.find();
    }

    const queryBuilder = this.tracksRepository.createQueryBuilder('track');

    // по прам.
    if (param) {
      queryBuilder.where(
        'track.name ILIKE :query OR track.artist ILIKE :query',
        { query: `%${param}%` },
      );
    }

    // к req + `найти`.`брать`(`считать`).`пропустить`(`компенсировать`)
    queryBuilder.take(count).skip(offset);

    const tracks = await queryBuilder.getMany();

    if (!tracks.length && param) {
      throw new NotFoundException(`По '${param}' не нашёл трека`);
    }

    return tracks;
  }

  // ОДИН Трек по ID
  async findOneTrack(param: string): Promise<TrackEntity | TrackEntity[]> {
    // логи,перем.ошб.
    this.logger.info(
      `Получение Audio по PARAM ${param} из ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `Audio с PARAM ${param} нет в БД`;
    const whereCondition: any = {};
    // условия res. id/num|eml/@|fullname/str
    // ^^ дораб.распозн.стиль ч/з enum | регул.выраж. | шаблона строки
    if (!isNaN(Number(param))) {
      whereCondition.id = param;
    }
    // е/и str то Поиск
    else if (typeof param === 'string') {
      return await this.searchTrack(param);
    }
    // объ.res, обраб.ошб., res по значени.
    const track = await this.tracksRepository.findOne({
      where: whereCondition,
    });
    if (!track) throw new NotFoundException('Такого Трека нет');
    return track;
  }

  async updateTrack(
    id: number,
    updateTrackDto: any /* UpdateTrackDto */,
  ): Promise<TrackEntity> {
    // return this.tracksRepository.update(id, updateTrackDto); // ! ошб. т.к. возвращ.UpdateResult, а не TrackEntity
    await this.tracksRepository.update(id, updateTrackDto);
    const updatedTrack = await this.tracksRepository.findOneBy({ id });
    if (!updatedTrack) throw new NotFoundException('Трек не найден');
    return updatedTrack;
  }

  // УДАЛЕНИЕ мягкое
  async deleteTrack(
    ids: any /* string | number */,
    userId?: number,
    param?: string,
  ) {
    console.log('T.s. DEL ids userId : ', ids, userId);

    // ошб.е/и нет ID
    if (!ids) {
      throw new NotFoundException('Нет данных Трека > Удаления');
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

    // полн.удал.Трека е/и нет userId и param
    if (!userId && !param) {
      throw new NotFoundException('Предовращено полное удаление Трека');
      // return await this.tracksRepository.delete(ids);
    }

    // генер.спец. SQL req ч/з `Создать строитель запросов`. Raw вернёт все поля вместе с ManyToOne
    const qbTracks = this.tracksRepository
      .createQueryBuilder('tracks')
      .withDeleted()
      // .where('id IN (:...ids)', { ids: idsArray });
      // наход.ф.по ids И userId
      .where('id IN (:...ids) AND tracks.user = :userId', {
        ids: idsArray,
        userId: userId,
      });
    const qbTracksGet = await qbTracks.getRawMany();

    // ошб.е/и нет qbTracksGet
    if (!qbTracksGet[0] || qbTracksGet[0].length === 0) {
      throw new NotFoundException('Трек/и отсутствуют');
    }
    // перем./ошб. при deletedAt !== null
    const invalidTracks = qbTracksGet.filter(
      (track) => track.tracks_deletedAt !== null,
    );
    if (invalidTracks.length > 0) {
      const invalidTrack = invalidTracks
        .map(
          (track) => "'" + track.tracks_name + "'" + ' с ID_' + track.tracks_id,
        )
        .join(', ');
      throw new NotFoundException(`Трек/и ${invalidTrack} удален/ы ранее`);
    }

    // сразу пометка`мягк.удал.`ф. при парам.
    if (param) {
      return qbTracks
        .softDelete()
        .where('id IN (:...ids)', { ids: idsArray })
        .execute();
    }

    // ^^ удал.данн.др.табл.

    // вызов сгенер.спец.SQL req ч/з `создать строитель запросов`
    const tracksData = await qbTracks
      .select([
        'tracks.path AS path',
        'tracks.coverId',
        'tracks.albumId',
        'tracks.duration AS duration',
        'tracks.genre AS genre',
        'tracks.fileId',
      ])
      .getRawMany();

    // перебор всех track
    for (let i = 0; i < tracksData.length; i++) {
      const trackOne = tracksData[i];
      const pathSTR = trackOne.path;
      const coverId = trackOne.coverId;
      const albumId = trackOne.albumId;
      const duration = trackOne.duration;
      const genres = trackOne.genre;
      const fileId = trackOne.fileId;

      // Удаление файлов из локального хранилища
      try {
        await fs.promises.unlink(pathSTR);
      } catch (error) {}
      // ID Обложки Альбома
      let albums_coverId;
      // удал.ф.Обложки и удал./обнов.Альбома и если не удал.уже
      if (coverId && albumId && qbTracksGet[i].tracks_deletedAt === null) {
        // const album = await this.albumsRepository.findOneBy({ id: albumId, });
        const albumGet = await this.albumsRepository
          .createQueryBuilder('albums')
          .withDeleted()
          .where({ id: albumId })
          .getRawOne();
        const totalAlbumData = {
          total_duration: duration,
          total_tracks: 1,
          genres: genres,
          deletedAt: null,
        };
        // ID Обложки Альбома
        albums_coverId = albumGet.albums_coverId;

        albumGet.albums_total_tracks == 1
          ? // удал.Альбома
            await this.albumsService.deleteAlbum(
              albumId,
              userId,
              totalAlbumData,
              `del`,
            )
          : // обнов.Альбома
            await this.albumsService.updateAlbum(
              albumId,
              null,
              totalAlbumData,
              'del',
            );
      }
      // удал.ф.Обложки Трека(е/и != ф.Обложки Алб) из таблицы File по coverId
      if (coverId != albums_coverId) {
        await this.filesService.removeFile(coverId, userId, `del ${coverId}`);
      }
      // удал.ф.Трека из таблицы File по fileId
      await this.filesService.removeFile(fileId, userId, `del`);
    }
    // пометка `мягк.удал.`ф.
    console.log('t.s. DEL 999 : ' + 999);
    return await qbTracks
      .softDelete()
      .where('id IN (:...ids)', { ids: idsArray })
      .execute();
  }

  // ДОБАВИТЬ РЕАКЦИЮ
  async addReactionTrack(
    createReactionDto: CreateReactionDto,
  ): Promise<ReactionEntity> {
    // ? получ.track
    const track = await this.tracksRepository.findOne({
      where: { id: createReactionDto.trackId },
    });

    // инициал.св-во reaction в track
    if (!track.reactions) {
      track.reactions = []; // Инициализация массива reactions, если он не определен
    }

    // ? получ.user
    const user = await this.usersRepository.findOne({
      where: { id: createReactionDto.userId },
    });

    // fn по возвр.наименьшего свободного id
    const smallestFreeId =
      await this.dataBaseUtils.getSmallestIDAvailable('reaction');

    // созд.реакцию по id track
    const reaction = this.reactionsRepository.create({
      ...createReactionDto,
      // ! ошб. - Ни одна перегрузка не соответствует этому вызову.
      // trackId: track.id, || userReqId (const userReqId = user.id;)
      track,
      user,
      id: smallestFreeId,
    });

    // добав.в track в масс.reactions одну реакцию
    // ! В track есть связка с reaction ч/з  reactions, но сам парам.reactions не заполняется и не отражается. Должен ли заполн./отраж.
    track.reactions.push(reaction);

    // запись в БД и возврат реакции
    await this.reactionsRepository.save(reaction);
    return reaction;
  }

  // поиск
  async searchTrack(query: string): Promise<TrackEntity[]> {
    // await this.tracksRepository.find({ where: [{ name: ILike(`%${query}%`) }, { artist: ILike(`%${query}%`) }], });
    const tracks = await this.tracksRepository
      .createQueryBuilder('track')
      .where('track.name ILIKE :query OR track.artist ILIKE :query', {
        query: `%${query}%`,
      })
      .getMany();
    if (tracks.length === 0)
      throw new NotFoundException(`Поиск по '${query}' не нашёл Трека`);
    return tracks;
  }

  // увелич.кол-во прослушивания
  async listenTrack(id: ObjectId) {
    const existingTrack = await this.tracksRepository
      .createQueryBuilder('tracks')
      .withDeleted()
      .where({ id: id })
      .getOne();
    existingTrack.listens += 1;
    await this.tracksRepository.save(existingTrack);
  }
}
