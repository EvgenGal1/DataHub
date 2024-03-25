/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      savesCover = null;
    try {
      // АУДИО.
      // перем.аудио.метаданых
      let audioObj,
        audioMetaData,
        deletedAtExist = null;
      // перебор всех audios.track
      for (const audioObjEl of audios?.track) {
        audioObj = audioObjEl;
        //   audios?.track && audios?.track?.length > 0 ? audios.track[0] : null;
        if (!audioObjEl) {
          throw new NotFoundException('Трек не передан для БД');
        }
        // `получить аудио метаданные`
        audioMetaData = await this.basicUtils.getAudioMetaData(audioObjEl);
        // проверка `существующий Трек` с учётом deletedAt
        const existingTrack = await this.tracksRepository
          .createQueryBuilder('tracks')
          .withDeleted()
          .where({ name: audioMetaData.title })
          .getMany();
        // ошб.Трек есть
        if (existingTrack.length > 0 && existingTrack[0]?.deletedAt === null) {
          throw new NotFoundException('Трек уже есть в БД');
        }
        // есть мягк.удал - очистка
        if (existingTrack.length > 0 && existingTrack[0]?.deletedAt != null) {
          deletedAtExist = null;
        }

        // ТРЕК(name,artist,text,genre) + savedFile(dto=obj<>num)
        if (
          typeof createTrackDto === 'object' ||
          createTrackDto === (null || undefined)
        ) {
          // проверка `существующий Файл` по имени с учётом deletedAt
          const existingFile = await this.filesRepository
            .createQueryBuilder('files')
            .withDeleted()
            .where({ filename: audioMetaData.originalname })
            .getMany();
          // присвойка существ.ID + обнов. <> сохр.Трек
          if (existingFile.length > 0 && existingFile[0]?.id) {
            savedFile = existingFile[0].id;
            const trackDelNull = existingFile[0];
            trackDelNull.deletedAt != null
              ? (trackDelNull.deletedAt = null)
              : trackDelNull.deletedAt;
            await this.filesRepository.save(trackDelNull);
          } else {
            // подмена пути ф. е/и загр.вместе с треком
            audioObjEl.destination = '/audios/track/';
            savedFile = await this.filesService.createFileByParam(
              audioObjEl,
              userId,
            );
          }
        } else {
          savedFile = createTrackDto ? createTrackDto : null;
          // приведение к типу JSON обратно из строки odj<>str createTrackDto после track.cntrl.ApiBody.schema
          // trackDto = JSON.parse(createTrackDto['createTrackDto']);
        }
      }

      // COVER(обложка).
      if (audios?.cover && audios?.cover.length > 0 && audios?.track) {
        // проверка `существующий Обложки` по имени
        const existingCover = await this.filesRepository
          .createQueryBuilder('files')
          .withDeleted()
          .where({ filename: audios.cover[0].filename })
          .getMany();
        // присвойка существ.ID + обнов. <> сохр.Обложку
        if (existingCover && existingCover[0]?.id) {
          savesCover = existingCover[0].id;
          const coverDelNull = existingCover[0];
          coverDelNull.deletedAt != null
            ? (coverDelNull.deletedAt = null)
            : coverDelNull.deletedAt;
          await this.filesRepository.save(coverDelNull);
        } else {
          // подмена пути ф. е/и загр.вместе с треком
          audios.cover[0].destination = '/images/album/';
          // сохр.обложку Files
          savesCover = await this.filesService.createFileByParam(
            audios.cover[0],
            userId,
          );
        }
      }

      // АЛЬБОМ
      if ((audios?.cover && audios?.cover?.length > 0) || audioMetaData.cover) {
        const albumData = audios.cover[0];
        // проверка `существующий Альбом` по заголовку с учётом deletedAt
        const existingAlbum = await this.albumsRepository
          .createQueryBuilder('albums')
          .withDeleted()
          .where({ title: audioMetaData.album })
          .getMany();

        // присвойка существ.ID + обнов. <> сохр.Альбома
        if (existingAlbum && existingAlbum[0]?.id) {
          savedAlbum = existingAlbum[0].id;
          // есть мягк.удал - очистка <> нет - обнов.доп.поля
          let totalAlbumData;
          if (existingAlbum[0]?.deletedAt != null) {
            totalAlbumData = { deletedAt: null };
          } else {
            totalAlbumData = {
              total_duration: audioMetaData.duration,
              total_tracks: 1,
              genres: audioMetaData.genre,
              deletedAt: null,
            };
          }

          // обнов.основ.данн.полей
          let basicAlbumData = null;
          if (savesCover?.target && existingAlbum[0]?.path == null) {
            basicAlbumData = {
              title: existingAlbum[0].title || albumData?.title,
              author: existingAlbum[0].author || albumData?.artist,
              year: existingAlbum[0].year || albumData?.year,
              genres: existingAlbum[0].genres || albumData?.genre,
              path:
                existingAlbum[0].path ||
                savesCover?.target + savesCover.filename,
              cover: savesCover.id,
            };
          }
          // обнов.данн.Альбома
          await this.albumsService.updateAlbum(
            savedAlbum,
            basicAlbumData,
            totalAlbumData,
            'add',
          );
        }
        // созд.нов.Альбом
        else {
          // объ.основ.хар-ик Альбома
          // const albumDto = new CreateAlbumDto();
          const basicAlbumData = {
            // ...albumDto,
            title: audioMetaData.album || albumData?.title,
            author: audioMetaData.artist || albumData?.artist,
            year: Number(audioMetaData.year) || albumData?.year,
            genres: audioMetaData.genre || albumData?.genre,
            path: albumData?.destination
              ? albumData?.destination + albumData.filename
              : '',
          };
          // объ.доп.хар-ик
          const totalAlbumData = {
            total_duration: audioMetaData.duration,
            total_tracks: 1,
          };
          // сохр.
          savedAlbum = await this.albumsService.createAlbum(
            basicAlbumData,
            userId,
            savesCover?.id || savesCover,
            totalAlbumData,
          );
        }
      }

      // обнов.данн.Трека
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
      const track = this.tracksRepository.create({
        ...basicTrackData,
        id: smallestFreeId,
        path: audioObj?.destination + audioObj.filename,
        listens: 0,
        duration: audioMetaData.duration || 0,
        file: savedFile?.id ? savedFile.id : savedFile,
        album: savedAlbum?.id || savedAlbum,
        cover: savesCover?.id || savesCover,
        user: { id: userId },
        deletedAt: deletedAtExist,
        // sampleRate: audioMetaData.sampleRate, // частота дискретизации
        // bitrate: audioMetaData.bitrate:,
        // year: audioMetaData.year:,
      });
      console.log('t.s track : ', track);
      savedTrack = await this.tracksRepository.save(track);
      return savedTrack;
    } catch (error) {
      console.log('t.s.Param catch error : ', error);
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
  async findAllTracks(/* count = 10, offset = 0 */): Promise<TrackEntity[]> {
    return this.tracksRepository.find() /* .skip(Number(offset)).limit(Number(count)) */;
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

  // пометка Удаления
  async deleteTrack(
    ids: any /* string | number */,
    userId?: number,
    param?: string,
  ) {
    console.log('T.s. DEL ids userId : ', ids, userId);

    // ошб.е/и нет ID
    if (!ids) {
      throw new NotFoundException('Нет Трека > Удаления');
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

    // полн.удал.Трека е/и нет userId
    if (!userId && !param) {
      console.log('T.s. DEL FULL_DEL ids : ', ids);
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
    const qbTracks123 = await qbTracks.getRawMany();

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
    // параметры в перемен.масс.
    const pathArray = tracksData.map((obj) => obj.path);
    const coverIdsArray = tracksData.map((obj) => obj.coverId);
    const albumIdsArray = tracksData.map((obj) => obj.albumId);
    const durationArray = tracksData.map((obj) => obj.duration);
    const genresArray = tracksData.map((obj) => obj.genre);
    const fileIdsArray = tracksData.map((obj) => obj.fileId);

    // Удаление файлов из локального хранилища
    for (const path of pathArray) {
      try {
        await fs.promises.unlink(path);
      } catch (error) {
        console.log('t.s. DEL error : ' + error);
      }
    }

    // Удаление ф.обложки из таблицы File по coverId
    if (coverIdsArray[0] != null) {
      await this.filesService.removeFile(
        coverIdsArray,
        userId,
        `DEL ${coverIdsArray}`,
      );
    }

    // Обработка данных таблицы Album
    for (let i = 0; i < albumIdsArray.length; i++) {
      const albumId = parseInt(albumIdsArray[i], 10);
      // const trackCount = 1; // У нас всегда 1 трек на удаление
      const trackCount = isNaN(Number(ids)) ? ids.length : 1; // У нас всегда 1 трек на удаление
      // основ.данн.
      const totalAlbumData = {
        total_duration: durationArray[0],
        total_tracks: trackCount,
        genres: genresArray[0],
        deletedAt: null,
      };
      // удал.
      await this.albumsService.deleteAlbum(
        albumId,
        userId,
        totalAlbumData,
        (param = 'del'),
      );
    }

    // Удаление ф.трека из таблицы File по fileId
    for (const fileId of fileIdsArray) {
      await this.filesService.removeFile(
        fileIdsArray,
        userId,
        `DEL ${fileIdsArray}`,
      );
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
  // async search(query: string): Promise<Track[]> {
  //     const tracks = await this.trackModel.find({
  //         name: {$regExStand: new RegExp(query, 'i')}
  //     })
  //     return tracks;
  // }

  // ? кол-во прослушивания
  // async listen(id: ObjectId) {
  //     const track = await this.trackModel.findById(id);
  //     track.listens += 1
  //     track.save()
  // }
}
function Null(): Date | import('typeorm').FindOperator<Date> {
  throw new Error('Function not implemented.');
}
