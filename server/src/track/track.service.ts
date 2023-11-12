/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackEntity } from './entities/track.entity';

@Injectable()
export class TrackService {
  // ч/з внедрение зависимостей, добав.доп.repository TrackEntity. Указав так repositorий, получ.возм.внутри этого кл.UsersService раб.с табл.users
  constructor(
    @InjectRepository(TrackEntity)
    private repository: Repository<TrackEntity>,
  ) {}

  create(createTrackDto: CreateTrackDto) {
    return 'Это действие добавляет новый трек';
  }

  findAll() {
    // return `Это действие возвращает все треки`;
    return this.repository.find();
  }

  findOne(id: number) {
    // return `Это действие возвращает трек с id #${id}`;
    return this.repository.findOneBy({ id });
  }

  update(id: number, updateTrackDto: UpdateTrackDto) {
    return `Это действие обновляет трек с id #${id}`;
  }

  remove(id: number) {
    return `Это действие удаляет трек с id #${id}`;
  }
}
