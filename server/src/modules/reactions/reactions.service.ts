import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { ReactionEntity } from './entities/reaction.entity';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import { isProduction, isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly logger: LoggingWinston,
    @InjectRepository(ReactionEntity, isProduction ? 'supabase' : 'localhost')
    private readonly reactionRepository: Repository<ReactionEntity>,
    private readonly basicUtils: BasicUtils,
    private readonly dataBaseUtils: DatabaseUtils,
  ) {}

  async createReaction(
    createReactionDto: CreateReactionDto,
  ): Promise<ReactionEntity> {
    try {
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('react');
      // созд.репоз. / обраб.ошб.
      const reactCre = this.reactionRepository.create({
        ...createReactionDto,
        id: smallestFreeId,
      });
      if (!reactCre) {
        this.logger.error(
          `React DTO '${JSON.stringify(createReactionDto)}' не создан`,
        );
        throw new NotFoundException(
          `React DTO '${JSON.stringify(createReactionDto)}' не создан`,
        );
      }

      // log > DEV
      if (isDevelopment)
        this.logger.info(
          `db + React DTO : '${JSON.stringify(createReactionDto)}'`,
        );
      // сохр.,ошб.,лог.,возврат
      const savedReact: ReactionEntity =
        await this.reactionRepository.save(reactCre);
      if (!savedReact) {
        this.logger.error(
          `React DTO '${JSON.stringify(createReactionDto)}' не сохранён`,
        );
        throw new NotFoundException(
          `React DTO '${JSON.stringify(createReactionDto)}' не сохранён`,
        );
      }
      this.logger.info(`+ React.ID '${savedReact.id}'`);
      return savedReact;
    } catch (error) {
      this.logger.error(
        `!Ошб. + React: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `'rea.s. CRE : DTO '${JSON.stringify(createReactionDto)}'`,
        );
      throw error;
    }
  }

  async findAllReaction(): Promise<ReactionEntity[]> {
    try {
      if (isDevelopment) this.logger.info(`db << Reactions All`);
      const allReacts = await this.reactionRepository.find();
      if (!allReacts) {
        this.logger.error(`Reactions All не найден`);
        throw new NotFoundException(`Reactions All не найден`);
      }
      this.logger.info(
        `<< Reactions All length '${allReacts?.length}' < БД '${
          isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'
        }'`,
      );
      return allReacts;
    } catch (error) {
      this.logger.error(
        `!Ошб. << Reacts: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ОДИН по id
  async findOneReaction(id: number): Promise<ReactionEntity> {
    try {
      if (isDevelopment) this.logger.info(`db < React.ID '${id}'`);
      const react = await this.reactionRepository.findOneBy({ id });
      if (!react) {
        this.logger.error(`React.ID '${id}' не найден`);
        throw new NotFoundException(`React.ID '${id}' не найден`);
      }
      this.logger.info(`< React.ID '${react?.id}'`);
      return react;
    } catch (error) {
      this.logger.error(
        `!Ошб. < React.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // мтд.обновить
  async updateReaction(
    id: number,
    updateReactionDto: UpdateReactionDto,
  ): Promise<ReactionEntity> {
    try {
      const react = await this.reactionRepository.findOneBy({ id });
      if (!react) {
        this.logger.error(`React.ID '${id}' не найден`);
        throw new NotFoundException(`React.ID '${id}' не найден`);
      }

      // изменения
      Object.assign(react, updateReactionDto);

      // log > DEV
      if (isDevelopment)
        this.logger.info(
          `db # React '${await this.basicUtils.hendlerTypesErrors(react)}'`,
        );

      // сохр.,ошб.,лог.,возврат
      const reaUpd = await this.reactionRepository.save(react);
      if (!reaUpd) {
        this.logger.error(
          `React.ID '${id}' по DTO '${JSON.stringify(updateReactionDto)}' не обновлён`,
        );
        throw new NotFoundException(
          `React.ID '${id}' по DTO '${JSON.stringify(updateReactionDto)}' не обновлён`,
        );
      }
      this.logger.info(`# React.ID '${reaUpd.id}'`);
      return reaUpd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # React: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `rea.s. UPD : React.ID '${id}' | DTO '${JSON.stringify(updateReactionDto)}'`,
        );
      throw error;
    }
  }

  async removeReaction(id: number) {
    try {
      if (isDevelopment) this.logger.info(`db - React.ID: '${id}'`);
      const reaRem = await this.reactionRepository.softDelete(id);
      if (!reaRem) {
        this.logger.error(`React.ID '${id}' не удалён`);
        throw new NotFoundException(`React.ID '${id}' не удалён`);
      }
      this.logger.info(`- React.ID : '${reaRem}'`);
      return reaRem;
    } catch (error) {
      this.logger.error(
        `!Ошб. - React.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // востановить
  // async restoreReaction(id: number|string) {
  //   return await this.reactionionRepository.restore(id);
  // }

  // Удаление Полное
  async deleteReaction(
    reactionIds: string | number,
    userId?: number,
    // totalReactionDto?: TotalReactionDto,
    param?: string,
  ) {
    try {
      // ошб.е/и нет ID
      if (!reactionIds) {
        this.logger.error('Нет Реакции/ий > Удаления');
        throw new NotFoundException('Нет Реакции/ий > Удаления');
      }
      if (!userId && !param /* && !totalReactionDto */) {
        this.logger.error('Предовращено полное удаление Реакции/ий');
        throw new NotFoundException('Предовращено полное удаление Реакции/ий');
      }
    } catch (error) {
      this.logger.error(
        `!Ошб. - React.ID '${reactionIds}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }
}
