/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as fs from 'fs';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateAlbumDto } from 'src/albums/dto/create-album.dto';
import { TrackEntity } from './entities/track.entity';
import { AlbumEntity } from 'src/albums/entities/album.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { AlbumsService } from 'src/albums/albums.service';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/entities/file.entity';
import { DatabaseUtils } from 'src/utils/database.utils';
import { BasicUtils } from 'src/utils/basic.utils';
// второй подход сохр.в serv - плохо раб
// import { FileService, FileType } from '../file/file.service';

@Injectable()
export class TracksService {
  // ч/з внедр.завис. + TrackEntity,ReactionEntity,UserEntity > раб.ч/з this с табл.track,reaction,user
  constructor(
    @InjectRepository(TrackEntity)
    private tracksRepository: Repository<TrackEntity>,
    @InjectRepository(ReactionEntity)
    private reactionsRepository: Repository<ReactionEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
    private filesService: FilesService,
    @InjectRepository(AlbumEntity)
    private albumsRepository: Repository<AlbumEntity>,
    private albumsService: AlbumsService,
    private dataBaseUtils: DatabaseUtils,
    private basicUtils: BasicUtils,
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

      // АУДИО.
      // перебор всех audios.track
      for (const audioObj of audios?.track) {
        console.log('T.s. CRE audioObj : ', audioObj);
        // `получить аудио метаданные`
        const audioMetaData = await this.basicUtils.getAudioMetaData(audioObj);
        // проверка `существующий Трек` с учётом deletedAt
        const existingTrack = await this.tracksRepository
          .createQueryBuilder('tracks')
          .withDeleted()
          .where({ name: audioMetaData.title })
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
          //  обнов. <> сохр. Трек
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
        console.log('T.s. CRE savedFile = : ', savedFile);

        // COVER(обложка).
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
            // сохр.обложку Files
            savedCover = await this.filesService.createFileByParam(
              audios.cover[0],
              userId,
            );
          }
        }
        console.log('T.s. CRE savedCover = : ', savedCover);

        // АЛЬБОМ. есть ф.Обложки <> метаданн.Альбома
        if (audios?.cover?.length > 0 && audioMetaData.album) {
          // проверка `существующий Альбом` по заголовку с учётом deletedAt
          const existingAlbum = await this.albumsRepository
            .createQueryBuilder('albums')
            .withDeleted()
            .where({ title: audioMetaData.album })
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
            cover: savedCover?.id || savedCover,
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
            // очистка мягк.удал.
            if (existingAlbum?.deletedAt != null) {
              await this.albumsRepository.save({
                id: existingAlbum.id,
                deletedAt: (existingAlbum.deletedAt = null),
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
              savedCover?.id || savedCover,
              totalAlbumData,
            );
          }
        }
        console.log('T.s. CRE savedAlbum = : ', savedAlbum);

        // обнов.основ.данн.Трека
        const trackDto =
          createTrackDto instanceof CreateTrackDto
            ? createTrackDto
            : new CreateTrackDto();
        const basicTrackData = {
          ...trackDto,
          name:
            trackDto.name.includes('#') && audioMetaData.title
              ? audioMetaData.title
              : trackDto.name,
          genre:
            trackDto.genre.includes('#') && audioMetaData.genre
              ? audioMetaData.genre
              : trackDto.genre,
          artist:
            trackDto.artist.includes('#') && audioMetaData.artist
              ? audioMetaData.artist
              : trackDto.artist,
        };

        // trackID. `получить наименьший доступный идентификатор` из БД > табл.track
        const smallestFreeId =
          await this.dataBaseUtils.getSmallestIDAvailable('track');
        // объ.track созд./сохр./вернуть
        const track = /* this.tracksRepository.create( */ {
          ...basicTrackData,
          id: existingTrack?.id || smallestFreeId,
          path:
            existingTrack?.path ||
            savedFile.target + savedFile.filename ||
            audioObj.path,
          listens: 0,
          duration: audioMetaData.duration || 0,
          file: savedFile.id ? savedFile.id : savedFile,
          album: savedAlbum.id,
          cover: savedCover.id,
          user: { id: userId },
          // sampleRate: audioMetaData.sampleRate, // частота дискретизации
          // bitrate: audioMetaData.bitrate:,
          // year: audioMetaData.year:,
          reactions: null,
        }; /* ) */

        console.log('T.s. CRE track : ', track);
        savedTrack = await this.tracksRepository.save(track);
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
  async findAllTracks(count = 10, offset = 0) /* : Promise<TrackEntity[]> */ {
    // к req найти.`пропустить`(`компенсировать`).limit(считать)
    return this.tracksRepository.find({
      skip: Number(offset),
      take: Number(count),
    });
    // .skip(Number(offset)) // Свойство "skip" не существует в типе "Promise<TrackEntity[]>".
    // .limit(Number(count));
  }

  // ОДИН Трек по ID
  async findOneTrack(id: number): Promise<TrackEntity> {
    const track = await this.tracksRepository.findOneBy({ id });
    if (!track) throw new Error('Трек не найден');
    return track;
  }

  // ОДИН Трек по ID <> Названию <> Исполнителю
  async findTrackByParam(param: string) {
    const whereCondition: any = {};
    // условия res. id/num|eml/@|fullname/str
    // ^^ дораб.распозн.стиль ч/з enum | регул.выраж. | шаблона строки
    if (!isNaN(Number(param))) {
      whereCondition.id = param;
    } /* else if (param.includes('@')) {
      whereCondition.email = param;
    } */ else if (/* !param.includes('@') && */ typeof param === 'string') {
      whereCondition.fullname = param;
    }
    // объ.res, обраб.ошб., res по значени.
    const user = await this.tracksRepository.findOne({ where: whereCondition });
    if (!user) throw new Error('Такого Пользователя нет');
    return user;
  }

  async updateTrack(
    id: number,
    updateTrackDto: UpdateTrackDto,
    // updateTrackDto: any,
  ): Promise<TrackEntity> {
    // return this.tracksRepository.update(id, updateTrackDto); // ! ошб. т.к. возвращ.UpdateResult, а не TrackEntity
    await this.tracksRepository.update(
      id,
      updateTrackDto /* as QueryDeepPartialEntity<TrackEntity> */,
      // ! QueryDeepPartialEntity от двух ошибкок - здесь в updateTrackDto и в CreateTrackDto|UpdateTrackDto.album
      // в export class UpdateTrackDto extends PartialType(CreateTrackDto) {
      //   Свойство "album" в типе "UpdateTrackDto" невозможно присвоить тому же свойству в базовом типе "Partial<CreateTrackDto>".
      //     Тип "string | AlbumEntity" не может быть назначен для типа "string".
      //       Тип "AlbumEntity" не может быть назначен для типа "string".

      //   в await this.tracksRepository.update(id, updateTrackDto);
      //   Аргумент типа "UpdateTrackDto" нельзя назначить параметру типа "_QueryDeepPartialEntity<TrackEntity>".
      //     Типы свойства "album" несовместимы.
      //       Тип "string | AlbumEntity" не может быть назначен для типа "(() => string) | _QueryDeepPartialEntity<AlbumEntity>".
      //         Тип "string" не может быть назначен для типа "(() => string) | _QueryDeepPartialEntity<AlbumEntity>"
    );
    const updatedTrack = await this.tracksRepository.findOneBy({ id });
    if (!updatedTrack) throw new Error('Трек не найден');
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
      throw new NotFoundException('Предовращено полное удаление');
      // return await this.tracksRepository.delete(ids);
    }

    // генер.спец. SQL req ч/з `Создать строитель запросов`
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

      // удал.ф.Обложки и удал./обнов.Альбома и если не удал.уже
      if (coverId && albumId && qbTracksGet[i].tracks_deletedAt === null) {
        const album = await this.albumsRepository.findOneBy({
          id: albumId,
        });

        const totalAlbumData = {
          total_duration: duration,
          total_tracks: 1,
          genres: genres,
          deletedAt: null,
        };

        album.total_tracks == 1
          ? // удал.Альбома и ф.Обложки
            (await this.albumsService.deleteAlbum(
              albumId,
              userId,
              totalAlbumData,
              `del`,
            ),
            await this.filesService.removeFile(
              coverId,
              userId,
              `del ${coverId}`,
            ))
          : // обнов.Альбома
            await this.albumsService.updateAlbum(
              albumId,
              null,
              totalAlbumData,
              'del',
            );
      }

      // Удаление ф.трека из таблицы File по fileId
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
  async addReaction(
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

  // ? поиск
  async search(query: string) /* : Promise<TrackEntity[]> */ {
    const tracks = await this.tracksRepository.findOneBy({
      // name: { $regExStand: new RegExp(query, 'i') },
      // name: { $reg: new RegExp(query) },
      name: Like(`%${query}%`),
    });
    console.log('tracks : ' + tracks);
    return tracks;
  }

  // увелич.кол-во прослушивания
  async listen(id: /* ObjectId */ any) {
    const existingTrack = await this.tracksRepository
      .createQueryBuilder('tracks')
      .withDeleted()
      .where({ id: id })
      .getOne();
    existingTrack.listens += 1;
    await this.tracksRepository.save(existingTrack);
  }
}
function Null(): Date | import('typeorm').FindOperator<Date> {
  throw new Error('Function not implemented.');
}
