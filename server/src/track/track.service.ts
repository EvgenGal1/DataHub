/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackEntity } from './entities/track.entity';
import { CommentEntity } from './entities/comment.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TrackService {
  // ч/з внедр.завис. + TrackEntity,CommentEntity,UserEntity > раб.ч/з this с табл.track,comment,user
  constructor(
    @InjectRepository(TrackEntity)
    private trackRepository: Repository<TrackEntity>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  // `получить наименьший доступный идентификатор`
  async getSmallestAvailableId(tableName: string): Promise<number> {
    let customRepository: any;
    // опред.репозитор.
    if (tableName === 'track') customRepository = this.trackRepository;
    else if (tableName === 'comment') customRepository = this.commentRepository;
    // обраб.ошб.е/и табл.нет
    if (!customRepository) throw new Error('Неверное название таблицы');
    // состав.req к табл.tableName по id и по порядку возрастания
    const query = customRepository
      .createQueryBuilder(tableName)
      .select(`${tableName}.id`, 'id')
      .orderBy(`${tableName}.id`, 'ASC')
      .getRawMany();
    // req к БД и перем.сравн.в нач.знач.1
    const result = await query;
    let firstAvailableId = 1;
    // перебор result, сравн.id с нач.знач., увелич.на 1 е/и =, возврт. е/и !=
    for (const row of result) {
      const currentId = parseInt(row.id);
      if (currentId !== firstAvailableId) break;
      firstAvailableId++;
    }
    // возврат измен.нач.знач. е/и != track.id
    return firstAvailableId;
  }

  // СОЗД. трек. Req - CreateTrackDto, Res - TrackEntity в `Обещание`
  async create(createTrackDto: CreateTrackDto): Promise<TrackEntity> {
    // fn по возвр.наименьшего свободного id
    const smallestFreeId = await this.getSmallestAvailableId('track');

    return this.trackRepository.save({
      id: smallestFreeId,
      ...createTrackDto,
      listens: 0,
    });
  }

  // ВСЕ треки. Req - "", Res - масс.TrackEntity в `Обещание`
  async findAll(): Promise<TrackEntity[]> {
    return this.trackRepository.find();
  }

  // ОДИН трек.
  async findOne(id: number /* ObjectId */): Promise<TrackEntity> {
    return this.trackRepository.findOneBy({ id });
  }
  async findById(id: number): Promise<TrackEntity> {
    return this.trackRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateTrackDto: UpdateTrackDto,
  ) /* : Promise<TrackEntity> */ {
    // return this.trackRepository.update({ id, updateTrackDto });
  }

  async delete(id: number /* ObjectId */) /* : Promise<ObjectId> */ {
    // ! ошб. :Promise<ObjectId> <> return - В типе "UpdateResult" отсутствуют следующие свойства из типа "ObjectId": _bsontype, id, toHexString, toJSON и еще 3.
    // softDelete - запись > удал.; delete - удал.
    return this.trackRepository.softDelete(id);
  }

  // ДОБАВИТЬ КОММЕНТ
  async addComment(createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    // ? получ.track
    const track = await this.trackRepository.findOne({
      where: {
        id: createCommentDto.trackId,
      },
    });

    // инициал.св-во comments в track
    if (!track.comments) {
      track.comments = []; // Инициализация массива comments, если он не определен
      // ! в track.comments ничего не появляется
    }

    // ? получ.user
    const user = await this.userRepository.findOne({
      where: { id: createCommentDto.userId },
    });

    // fn по возвр.наименьшего свободного id
    const smallestFreeId = await this.getSmallestAvailableId('comment');

    // созд.коммент по id track
    const comment = this.commentRepository.create({
      ...createCommentDto,
      // ! ошб. - Ни одна перегрузка не соответствует этому вызову.
      // trackId: track.id, || userReqId (const userReqId = user.id;)
      track,
      user,
      id: smallestFreeId,
    });

    // добав.в track в масс.comments 1ин comment
    // ! В track есть связка с comment ч/з  comments, но сам парам.comments не заполняется и не отражается. Должен ли заполн./отраж.
    track.comments.push(comment);

    // запись в БД и возврат коммент
    await this.commentRepository.save(comment);
    return comment;
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
