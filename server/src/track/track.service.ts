/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackEntity } from './entities/track.entity';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TrackService {
  // ч/з внедр.завис. + TrackEntity,CommentEntity > раб.ч/з this с табл.track,comment
  constructor(
    @InjectRepository(TrackEntity)
    private trackRepository: Repository<TrackEntity>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  // СОЗД. трек. Req - CreateTrackDto, Res - TrackEntity в `Обещание`
  async create(createTrackDto: CreateTrackDto): Promise<TrackEntity> {
    // в res dto, `слушает`
    return this.trackRepository.save({ ...createTrackDto, listens: 0 });
  }

  // ВСЕ треки. Req - "", Res - масс.TrackEntity в `Обещание`
  async findAll(): Promise<TrackEntity[]> {
    return this.trackRepository.find();
  }

  // ОДИН трек.
  async findOne(id: number /* ObjectId */): Promise<TrackEntity> {
    // ! ошб. id:ObjectId <> findOneBy(id) - Тип "ObjectId" не может быть назначен для типа "FindOptionsWhere<TrackEntity> | Find...<>[] | number | FindOperator<number>"
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

  // async search(query: string): Promise<Track[]> {
  //     const tracks = await this.trackModel.find({
  //         name: {$regex: new RegExp(query, 'i')}
  //     })
  //     return tracks;
  // }

  // ДОБАВИТЬ КОММЕНТ
  async addComment(createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    const track = await this.trackRepository.findOne({
      where: { id: createCommentDto.trackId },
    });

    const comment = this.commentRepository.create({
      ...createCommentDto,
      track: track,
    });

    await this.commentRepository.save(comment);
    return comment;
  }

  // async listen(id: ObjectId) {
  //     const track = await this.trackModel.findById(id);
  //     track.listens += 1
  //     track.save()
  // }
}
