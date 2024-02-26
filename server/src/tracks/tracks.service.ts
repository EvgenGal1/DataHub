/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import * as mp3Duration from 'mp3-duration';
// var mp3Duration = require('mp3-duration');
import * as fs from 'fs';
// import path from 'path';
import * as path from 'path';
import * as mm from 'music-metadata';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackEntity } from './entities/track.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ReactionEntity } from 'src/reactions/entities/reaction.entity';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { FilesService } from 'src/files/files.service';
import { DatabaseUtils } from 'src/utils/database.utils';
import { FileEntity } from 'src/files/entities/file.entity';
import { fileTargets } from 'src/helpers/fileTargets';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
// два подхода сохр.
// import { FileService, FileType } from '../file/file.service';
// eslint-disable-next-line prettier/prettier

@Injectable()
export class TrackService {
  // ч/з внедр.завис. + TrackEntity,ReactionEntity,UserEntity > раб.ч/з this с табл.track,reaction,user
  constructor(
    @InjectRepository(TrackEntity)
    private trackRepository: Repository<TrackEntity>,
    @InjectRepository(ReactionEntity)
    private reactionRepository: Repository<ReactionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private filesService: FilesService,
    private databaseUtils: DatabaseUtils,
  ) {}

  // `получить путь/значен. файла `
  async getFileTarget(file: any): Promise<string> {
    let fileTarget: string;

    if (!file.destination && file.fileType) {
      fileTarget = fileTargets(file.fileType.toUpperCase());
      // удал."./static/" и послед.слеш.ч/з регул.выраж.
    } /* else if (!file.destination && !file.fileType && file.fieldname) {
      fileTarget = fileTargets(file.fieldname.toUpperCase());
      // удал."./static/" и послед.слеш.ч/з регул.выраж.
    } */ else {
      fileTarget = file.destination.replace(/^\.\/static\/|\/$/g, '');
    }

    console.log('getFileTarget fileTarget : ' + fileTarget);
    return fileTarget;
  }

  // `получить мета данн.аудио файла`
  async getAudioMetaData(audio: Express.Multer.File): Promise<number> {
    console.log('getAudioMetaData 0 : ' + 0);

    let audiometadata;
    if (audio.buffer) {
      audiometadata = audio.buffer;
    } else if (audio.path) {
      const audioPath = audio.path;
      audiometadata = fs.readFileSync(audioPath);
    }

    const metadata = await mm.parseBuffer(audiometadata);

    console.log('metadata COMMIT : ' + metadata);
    // console.log(metadata.format);
    // console.log(metadata.common);
    // {
    //   tagTypes: [ 'ID3v2.3', 'ID3v1' ],
    //   trackInfo: [],
    //   lossless: false,
    //   container: 'MPEG',
    //   codec: 'MPEG 1 Layer 3',
    //   sampleRate: 44100,
    //   numberOfChannels: 2,
    //   bitrate: 192000,
    //   tool: 'LAME 3.97UU',
    //   codecProfile: 'CBR',
    //   numberOfSamples: 10180224,
    //   duration: 230.84408163265306
    // }
    // {
    //   track: { no: 5, of: null },
    //   disk: { no: null, of: null },
    //   movementIndex: {},
    //   albumartist: '4 àïðåëÿ',
    //   title: 'Íîâàÿ âåñíà',
    //   artists: [ '4 àïðåëÿ' ],
    //   artist: '4 àïðåëÿ',
    //   album: 'Íîâàÿ âåñíà',
    //   year: 2008,
    //   genre: [ 'emocore' ],
    //   comment: [ 'snakelp collection' ]
    // }

    return metadata.format.duration;
  }

  // СОЗД. трек. Req - CreateTrackDto, Res - TrackEntity в `Обещание`
  // СОЗД.Трек. Req - CreateTrackDto,picture,audio  Res - TrackEntity в `Обещание`
  async createTrack(
    createTrackDto: CreateTrackDto,
    files: Record<string, Express.Multer.File[]>,
    userId: number,
  ) /* : Promise<TrackEntity> */ {
    // ~
    console.log('track.serv 0 : ' + 0);
    console.log(
      'track.serv DTO | files | userId : ',
      createTrackDto,
      '|',
      files,
      '|',
      userId,
    );

    // обраб.ф.
    const { album, audio } = files;
    const albumObj = album[0];
    const audioObj = audio[0];
    // обраб.масс.ф. for..of | forEach
    // for (const pictureObject of picture) {
    //   console.log('picture.originalname:', pictureObject.originalname);
    // }
    // audio.forEach((audioObject, index) => {
    //   console.log(`audio[${index}].originalname:`, audioObject.originalname);
    // });
    // audio: {
    //     fieldname: 'audio',
    //     originalname: '4 Ð°Ð¿Ñ\x80ÐµÐ»Ñ\x8F - Ð\x9DÐ¾Ð²Ð°Ñ\x8F Ð²ÐµÑ\x81Ð½Ð°.mp3',
    //     encoding: '7bit',
    //     mimetype: 'audio/mpeg',
    //     destination: './static/audios/track/',
    //     filename: '06-12-2023_d452ab5b1257fd4cf5.mp3',
    //     path: 'static\\audios\\track\\06-12-2023_d452ab5b1257fd4cf5.mp3',
    //     size: 5541202
    //   }
    // album: {
    //     fieldname: 'album',
    //     originalname: '50-271834136.jpg',
    //     encoding: '7bit',
    //     mimetype: 'image/jpeg',
    //     destination: './static/images/album/',
    //     filename: '06-12-2023_13dc91fc34c94abe6b.jpg',
    //     path: 'static\\images\\album\\06-12-2023_13dc91fc34c94abe6b.jpg',
    //     size: 526843
    //   }
    //

    // сохр. Файла Обложи Альбома
    const file = await this.filesService.createFile(
      albumObj,
      albumObj.destination,
      userId,
    );
    console.log('file : ', file);

    // ^^ продумать логику альбома ID | Названия
    // const album = this.albumRepository.create(trackData.album);
    // /* track.file =  */ await this.fileRepository.save(file);
    // track.album = await this.albumRepository.save(album);
    // return this.trackRepository.save(track);
    //
    // ^^ настроить паралел.сохр.в serv.file с тип audio > сохр.в track и <> в serv.track с тип cover/image > сохр.в file

    //  опред.путь сохр./значен. по выбран.типу
    const audioFileTarget = await this.getFileTarget(audioObj);
    console.log('f.serv audioFileTarget: ', audioFileTarget);

    // `получить наименьший доступный идентификатор` из БД > табл.track
    const smallestFreeId =
      await this.databaseUtils.getSmallestIDAvailable('track');

    // `получить аудио метаданные`. Пока только duration
    const audioMetaData = await this.getAudioMetaData(audioObj);
    // `total Seconds` округ.до ближ.цел.значения, раздел.на 60, верн.ближ.целое(получ.цел.сек.) + ":" + округ.до ближ.цел.значения и раздел.на остаток 60(получ.остаток секунд)
    const totalSeconds =
      String(Math.floor(Math.round(audioMetaData) / 60)) +
      ':' +
      String(Math.round(audioMetaData) % 60);

    // ^^ приведение к типу JSON обратно из строки odj<>str createTrackDto после track.cntrl.ApiBody.schema
    const data: any = createTrackDto;
    const parsedData: any = JSON.parse(data.createTrackDto);

    // объ.track созд./сохр./вернуть
    const track = this.trackRepository.create({
      ...parsedData, // name, artist, text
      audio: audioFileTarget + '/' + audioObj.filename, // audioObj.path, // audioPath,
      // picture: albumObj.path, // picturePath,
      user: { id: userId },
      // ? file ? заменить <> picture
      id: smallestFreeId,
      cover: file.id,
      listens: 0,
      duration: totalSeconds,
      // ^^ продумать логику альбома ID | Названия
      // album: album.id
    });
    console.log('track.serv track : ', track);
    // track.serv track :  TrackEntity {
    //   id: 4,
    //   name: 'Название трк.#',
    //   artist: 'Артист #',
    //   text: 'Текст #',
    //   listens: 0,
    //   audio: 'audios/track/06-12-2023_6104c36e8f71118eeaa.mp3',
    //   style: 'Other #',
    //   duration: '3:51',
    //   user: UserEntity { id: 1 }
    // }

    await this.trackRepository.save(track);
    return track;
  }

  // ВСЕ треки. Req - "", Res - масс.TrackEntity в `Обещание`
  async findAllTracks(/* count = 10, offset = 0 */): Promise<TrackEntity[]> {
    return this.trackRepository.find() /* .skip(Number(offset)).limit(Number(count)) */;
  }

  // ОДИН Трек по ID
  async findOneTrack(id: number): Promise<TrackEntity> {
    const track = await this.trackRepository.findOneBy({ id });
    if (!track) throw new Error('Трек не найден');
    return track;
  }

  // ОДИН Трек по ID <> Названию <> Исполнителю
  async findTrackByParam(param: string) {
    const whereCondition: any = {};
    // условия res. id/num|eml/@|fullname/str // ^^ дораб.распозн.стиль ч/з enum | регул.выраж. | шаблона строки
    if (!isNaN(Number(param))) {
      whereCondition.id = param;
    } /* else if (param.includes('@')) {
      whereCondition.email = param;
    } */ else if (/* !param.includes('@') && */ typeof param === 'string') {
      whereCondition.fullname = param;
    }
    // объ.res, обраб.ошб., res по значени.
    const user = await this.userRepository.findOne({ where: whereCondition });
    if (!user) throw new Error('Такого Пользователя нет');
    return user;
  }

  async updateTrack(
    id: number,
    updateTrackDto: UpdateTrackDto,
    // updateTrackDto: any,
  ): Promise<TrackEntity> {
    // return this.trackRepository.update(id, updateTrackDto); // ! ошб. т.к. возвращ.UpdateResult, а не TrackEntity
    await this.trackRepository.update(
      id,
      updateTrackDto as QueryDeepPartialEntity<TrackEntity>,
      // ! QueryDeepPartialEntity от двух ошибкок - здесь в updateTrackDto и в CreateTrackDto|UpdateTrackDto.album
      // в export class UpdateTrackDto extends PartialType(CreateTrackDto) {
      //   Свойство "album" в типе "UpdateTrackDto" невозможно присвоить тому же свойству в базовом типе "Partial<CreateTrackDto>".
      //     Тип "string | AlbumEntity" не может быть назначен для типа "string".
      //       Тип "AlbumEntity" не может быть назначен для типа "string".

      //   в await this.trackRepository.update(id, updateTrackDto);
      //   Аргумент типа "UpdateTrackDto" нельзя назначить параметру типа "_QueryDeepPartialEntity<TrackEntity>".
      //     Типы свойства "album" несовместимы.
      //       Тип "string | AlbumEntity" не может быть назначен для типа "(() => string) | _QueryDeepPartialEntity<AlbumEntity>".
      //         Тип "string" не может быть назначен для типа "(() => string) | _QueryDeepPartialEntity<AlbumEntity>"
    );
    const updatedTrack = await this.trackRepository.findOneBy({ id });
    if (!updatedTrack) throw new Error('Трек не найден');
    return updatedTrack;
  }

  async deleteTrack(id: number /* ObjectId */) /* : Promise<ObjectId> */ {
    // ! ошб. :Promise<ObjectId> <> return - В типе "UpdateResult" отсутствуют следующие свойства из типа "ObjectId": _bsontype, id, toHexString, toJSON и еще 3.
    // softDelete - запись > удал.; delete - удал.
    return this.trackRepository.softDelete(id);
  }

  // ДОБАВИТЬ РЕАКЦИЮ
  async addReaction(
    createReactionDto: CreateReactionDto,
  ): Promise<ReactionEntity> {
    // ? получ.track
    const track = await this.trackRepository.findOne({
      where: { id: createReactionDto.trackId },
    });

    // инициал.св-во reaction в track
    if (!track.reactions) {
      track.reactions = []; // Инициализация массива reactions, если он не определен
    }

    // ? получ.user
    const user = await this.userRepository.findOne({
      where: { id: createReactionDto.userId },
    });

    // fn по возвр.наименьшего свободного id
    const smallestFreeId =
      await this.databaseUtils.getSmallestIDAvailable('reaction');

    // созд.реакцию по id track
    const reaction = this.reactionRepository.create({
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
    await this.reactionRepository.save(reaction);
    return reaction;
  }

  // ? поиск
  // async search(query: string): Promise<Track[]> {
  //     const tracks = await this.trackModel.find({
  //         name: {$regex: new RegExp(query, 'i')}
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
