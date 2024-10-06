/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';

import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../../config/envs/env.consts';

@Injectable()
export class ReactionsService {
  constructor(
    // логи
    @Inject('WINSTON_LOGGER') private readonly logger: Logger,
  ) {}

  create(createReactionDto: CreateReactionDto) {
    // логи,перем.ошб.
    this.logger.info(
      `Запись Reaction в БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `Reaction не сохранён в БД`;
    return 'This action adds a new reaction';
  }

  findAll() {
    // логи,перем.ошб.
    this.logger.info(
      `Получение всех Reactions из БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `Reactions нет в БД`;
    return `This action returns all reactions`;
  }

  findOne(id: number) {
    // логи,перем.ошб.
    this.logger.info(
      `Получение Reaction по ID ${id} из ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `Reaction с ID ${id} нет в БД`;
    return `This action returns a #${id} reaction`;
  }

  update(id: number, updateReactionDto: UpdateReactionDto) {
    return `This action updates a #${id} reaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} reaction`;
  }
}
