/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackEntity } from './entities/track.entity';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class TrackService {
  // ч/з внедр.завис. + TrackEntity,CommentEntity > раб.ч/з this с табл.track,comment
  constructor(
    @InjectRepository(TrackEntity)
    @InjectRepository(CommentEntity)
    private trackEntity: Repository<TrackEntity>, // private repository: Repository<CommentEntity>
  ) {}

  // СОЗД. трек. Req - CreateTrackDto, Res - TrackEntity в `Обещание`
  async create(createTrackDto: CreateTrackDto): Promise<TrackEntity> {
    // в res dto, `слушает`
    return this.trackEntity.save({ ...createTrackDto, listens: 0 });
  }

  // ВСЕ треки. Req - "", Res - масс.TrackEntity в `Обещание`
  async findAll(): Promise<TrackEntity[]> {
    return this.trackEntity.find();
  }

  // ОДИН трек.
  async findOne(id: number /* ObjectId */): Promise<TrackEntity> {
    // ! ошб. id:ObjectId <> findOneBy(id) - Тип "ObjectId" не может быть назначен для типа "FindOptionsWhere<TrackEntity> | Find...<>[] | number | FindOperator<number>"
    return this.trackEntity.findOneBy({ id });
  }

  async update(
    id: number,
    updateTrackDto: UpdateTrackDto,
  ) /* : Promise<TrackEntity> */ {
    // return this.trackEntity.update({ id, updateTrackDto });
  }

  async delete(id: number /* ObjectId */) /* : Promise<ObjectId> */ {
    // ! ошб. :Promise<ObjectId> <> return - В типе "UpdateResult" отсутствуют следующие свойства из типа "ObjectId": _bsontype, id, toHexString, toJSON и еще 3.
    // softDelete - запись > удал.; delete - удал.
    return this.trackEntity.softDelete(id);
  }

  // async search(query: string): Promise<Track[]> {
  //     const tracks = await this.trackModel.find({
  //         name: {$regex: new RegExp(query, 'i')}
  //     })
  //     return tracks;
  // }

  //   async addComment(dto: CreateCommentDto): Promise<Comment> {
  //     const track = await this.trackModel.findById(dto.trackId);
  //     const comment = await this.commentModel.create({...dto})
  //     track.comments.push(comment._id)
  //     await track.save();
  //     return comment;
  // }

  // async listen(id: ObjectId) {
  //     const track = await this.trackModel.findById(id);
  //     track.listens += 1
  //     track.save()
  // }
}
