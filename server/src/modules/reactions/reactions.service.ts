import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ReactionEntity } from './entities/reaction.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import { isProduction, isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly logger: LoggingWinston,
    @InjectRepository(ReactionEntity, process.env.DB_NAM)
    private readonly reactionRepository: Repository<ReactionEntity>,
    private readonly basicUtils: BasicUtils,
    private readonly dataBaseUtils: DatabaseUtils,
  ) {}

  async createReaction(
    createReactionDto: CreateReactionDto,
  ): Promise<ReactionEntity> {
    try {
      if (isDevelopment)
        this.logger.info(
          `db + React DTO : '${JSON.stringify(createReactionDto)}'`,
        );

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

      // сохр.,ошб.,лог.,возврат
      const savedReact: ReactionEntity =
        await this.reactionRepository.save(reactCre);
      if (!savedReact) {
        this.logger.warn(
          `React DTO '${JSON.stringify(createReactionDto)}' не сохранён`,
        );
        throw new NotFoundException(
          `React DTO '${JSON.stringify(createReactionDto)}' не сохранён`,
        );
      }
      this.logger.debug(`+ React.ID '${savedReact.id}'`);
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
        this.logger.warn(`Reactions All не найден`);
        throw new NotFoundException(`Reactions All не найден`);
      }
      this.logger.debug(
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
        this.logger.warn(`React.ID '${id}' не найден`);
        throw new NotFoundException(`React.ID '${id}' не найден`);
      }
      this.logger.debug(`< React.ID '${react?.id}'`);
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
      if (isDevelopment)
        this.logger.info(
          `db # React.ID '${id}' | DTO '${await this.basicUtils.hendlerTypesErrors(updateReactionDto)}'`,
        );

      const react = await this.reactionRepository.findOneBy({ id });
      if (!react) {
        this.logger.warn(`React.ID '${id}' не найден`);
        throw new NotFoundException(`React.ID '${id}' не найден`);
      }

      // изменения
      Object.assign(react, updateReactionDto);

      // сохр.,ошб.,лог.,возврат
      const reaUpd = await this.reactionRepository.save(react);
      if (!reaUpd) {
        this.logger.warn(
          `React.ID '${id}' по DTO '${JSON.stringify(updateReactionDto)}' не обновлён`,
        );
        throw new NotFoundException(
          `React.ID '${id}' по DTO '${JSON.stringify(updateReactionDto)}' не обновлён`,
        );
      }
      this.logger.debug(`# React.ID '${reaUpd.id}'`);
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
        this.logger.warn(`React.ID '${id}' не удалён`);
        throw new NotFoundException(`React.ID '${id}' не удалён`);
      }
      this.logger.debug(`- React.ID : '${reaRem}'`);
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
  ): Promise<void> {
    try {
      // ошб.е/и нет ID
      if (!reactionIds) {
        this.logger.warn('Нет Реакции/ий > Удаления');
        throw new NotFoundException('Нет Реакции/ий > Удаления');
      }
      if (!userId && !param /* && !totalReactionDto */) {
        this.logger.warn('Предовращено полное удаление Реакции/ий');
        throw new NotFoundException('Предовращено полное удаление Реакции/ий');
      }
    } catch (error) {
      this.logger.error(
        `!Ошб. - React.ID '${reactionIds}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ^^ Расшир.мтд. ----------------------------------------------------------------------------

  // Получить Дочерние Реакции по ID Родительской Реакции
  async findChildReactions(parentId: number): Promise<ReactionEntity[]> {
    try {
      if (isDevelopment)
        this.logger.info(`db < Child по React.parentId '${parentId}`);

      // загр. Дочерние Реакции по ID Родителя
      const childReactions = await this.reactionRepository.find({
        where: { parentReaction: { id: parentId } },
        relations: ['childReactions'], // Загружаем дочерние реакции
      });
      if (childReactions.length === 0) {
        this.logger.warn(`Child по React.parentId '${parentId}' не найдены`);
        throw new NotFoundException(
          `Child по React.parentId '${parentId}' не найдены`,
        );
      }

      this.logger.debug(`< Child по React.parentId '${parentId}'`);
      return childReactions;
    } catch (error) {
      this.logger.error(
        `!Ошб. < Child по React.parentId '${parentId}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // Получить Родительскую Реакцию по ID Дочерней Реакции
  async findParentReaction(childId: number): Promise<ReactionEntity> {
    try {
      if (isDevelopment)
        this.logger.info(`db < Parent по React.childId '${childId}`);

      // загр.связ. Родительскую Реакцию по ID Дочки
      const childReaction = await this.reactionRepository.findOne({
        where: { id: childId },
        relations: ['parentReaction'], // Загружаем родительскую реакцию
      });
      if (!childReaction || !childReaction.parentReaction) {
        this.logger.warn(`Parent по React.childId '${childId}' не найдены`);
        throw new NotFoundException(
          `Parent по React.childId '${childId}' не найдены`,
        );
      }

      this.logger.debug(`< Parent по React.childId '${childId}'`);
      return childReaction.parentReaction;
    } catch (error) {
      this.logger.error(
        `!Ошб. < Parent по React.childId '${childId}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // получить Реакции по связи Сущности/ID
  async findReactionsByEntity(
    entityId: number,
    entityType: string,
    includedParams: string | string[],
  ): Promise<ReactionEntity[]> {
    try {
      if (isDevelopment)
        this.logger.info(
          `db << React Entity '${entityType}' с ID '${entityId}'`,
        );
      // поля выбора
      const selectFields = [
        'reaction.id',
        'reaction.comment',
        'reaction.rating',
        // 'reaction.createdAt', 'reaction.deletedAt', // + даты к Родителю
      ];
      // созд.req > Родителя
      const baseQuery = this.reactionRepository
        .createQueryBuilder('reaction')
        .select(selectFields)
        .where(`reaction.${entityType}Id = :entityId`, { entityId })
        .andWhere('reaction.parentReaction IS NULL'); // + только в Родителя
      //  выгр.Родителя/Дочку из Реакций + связи по типу -  "user": { "id": 3 }, "file": null
      // const entityReact = await this.reactionRepository.createQueryBuilder('reaction').select(['reaction.id','reaction.comment','reaction.rating','reaction.createdAt','reaction.deletedAt','user.id','file.id','track.id','album.id','parentReaction.id','childReactions.id']).leftJoin('reaction.user', 'user').leftJoin('reaction.file', 'file').leftJoin('reaction.track', 'track').leftJoin('reaction.album', 'album').leftJoin('reaction.parentReaction', 'parentReaction').leftJoin('reaction.childReactions', 'childReactions').where(`reaction.${entityType} = :entityId`, { entityId }).getMany();

      // доп.req по вкл.парам
      if (includedParams) {
        // leftJoin > вложен.Реакций Детей
        if (includedParams.includes('childs')) {
          baseQuery.leftJoinAndSelect(
            'reaction.childReactions',
            'childReactions',
          );
        }
        // leftJoin > связей
        if (
          includedParams.includes('relationId') ||
          includedParams.includes('relationFull')
        ) {
          baseQuery
            .leftJoinAndSelect('reaction.user', 'user')
            .leftJoinAndSelect('reaction.file', 'file')
            .leftJoinAndSelect('reaction.track', 'track')
            .leftJoinAndSelect('reaction.album', 'album');
          // .leftJoinAndSelect('reaction.parentReaction', 'parentReaction');
        }
      }

      // req/данн./обраб.ошб
      let reactions: any = await baseQuery.getMany();
      if (reactions.length === 0) {
        this.logger.warn(
          `Реакций для Entity '${entityType}' с ID '${entityId}' не найдены`,
        );
        throw new NotFoundException(
          `Реакций для Entity '${entityType}' с ID '${entityId}' не найдены`,
        );
      }

      // рекурсивная обраб.вкл.парам. > вложенных Реакций
      if (includedParams && includedParams?.includes('childs')) {
        await this.loadChildsReactions(reactions, includedParams);
      }
      // с вкл.парам формир.req
      if (includedParams) {
        reactions = reactions.map((reaction: ReactionEntity) =>
          this.formatReaction(reaction, includedParams),
        );
      }

      this.logger.debug(
        `<< React Entity '${entityType}'/'${entityId}' кол-во '${reactions.length}'`,
      );
      return reactions;
    } catch (error) {
      this.logger.error(
        `!Ошб. << React Entity '${entityType}' с ID '${entityId}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // рекурс.загр.Реакций Дочерних/Детей. Дети <&> User Связи
  private async loadChildsReactions(
    reactions: ReactionEntity[],
    includedParams: string | string[],
  ) {
    // перебор эл.масс.reactions
    for (const reaction of reactions) {
      // е/и есть Дети
      if (reaction.childReactions && reaction.childReactions.length > 0) {
        // сбор всех ID Рекций Детей
        const childReactionIds = reaction.childReactions.map(
          (child) => child.id,
        );
        // поля выбора
        const selectFields: any = ['id', 'comment', 'rating'];
        // загр.Реакции Детей по ID, вкл.вложенности
        const childReactions = await this.reactionRepository.find({
          where: { id: In(childReactionIds) },
          select: selectFields,
          relations:
            // е/и `связь` + 'дочерний' - загр.ещё User
            (includedParams.includes('relationId') ||
              includedParams.includes('relationFull')) &&
            includedParams.includes('childs')
              ? ['user', 'childReactions']
              : // загр.без User
                includedParams.includes('childs')
                ? ['childReactions']
                : [],
        });
        // присвойка Детей к текущей Реакции
        reaction.childReactions = childReactions;
        // рекурс.загр.Реакции Детей > всех вложен.Реакций
        await this.loadChildsReactions(childReactions, includedParams);
      }
    }
  }

  // формир.res Реакций от параметров
  private formatReaction(
    reaction: ReactionEntity,
    includedParams: string | string[],
  ) {
    // мини.формат
    const formattedReaction: any = {
      id: reaction.id,
      comment: reaction.comment,
      rating: reaction.rating,
    };
    // по вкл.парам.формит.res. ID <> Full данн.
    if (includedParams?.includes('relationId')) {
      if (reaction.user?.id) formattedReaction.userId = reaction.user.id;
      if (reaction.file?.id) formattedReaction.fileId = reaction.file.id;
      if (reaction.track?.id) formattedReaction.trackId = reaction.track.id;
      if (reaction.album?.id) formattedReaction.albumId = reaction.album.id;
    } else if (includedParams?.includes('relationFull')) {
      if (reaction.user?.id) formattedReaction.user = reaction.user;
      if (reaction.file?.id) formattedReaction.file = reaction.file;
      if (reaction.track?.id) formattedReaction.track = reaction.track;
      if (reaction.album?.id) formattedReaction.album = reaction.album;
    }
    // рекурс.формир.Реакции Детей > всех вложен.Реакций
    if (reaction.childReactions) {
      formattedReaction.childReactions = reaction.childReactions.map((child) =>
        this.formatReaction(child, includedParams),
      );
    }

    return formattedReaction;
  }
}
