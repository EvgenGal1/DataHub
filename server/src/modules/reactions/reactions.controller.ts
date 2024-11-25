import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ReactionEntity } from './entities/reaction.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { ReactionsService } from './reactions.service';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Controller('/reactions')
@ApiTags('Реакции')
export class ReactionsController {
  constructor(
    private readonly reactionsService: ReactionsService,
    private readonly logger: LoggingWinston,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать Реакцию' })
  async createReaction(@Body() createReactionDto: CreateReactionDto) {
    this.logger.debug(
      `req + Reaction DTO : '${JSON.stringify(createReactionDto)}'`,
    );
    return this.reactionsService.createReaction(createReactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Реакции' })
  async findAllReaction() {
    this.logger.debug(`req << Reacts All`);
    return this.reactionsService.findAllReaction();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Реакцию' })
  async findOneReaction(@Param('id') id: number) {
    this.logger.debug(`req < React.ID '${id}'`);
    return this.reactionsService.findOneReaction(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Реакцию' })
  async updateReaction(
    @Param('id') id: number,
    @Body() updateReactionDto: UpdateReactionDto,
  ) {
    this.logger.debug(`req # React.ID '${id}'`);
    return this.reactionsService.updateReaction(+id, updateReactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Реакцию' })
  async removeReaction(@Param('id') id: number) {
    this.logger.debug(`req - React.ID '${id}'`);
    return this.reactionsService.removeReaction(+id);
  }

  // ^^ Расшир.мтд. ----------------------------------------------------------------------------

  @Get('/child-reactions/:parentId')
  @ApiOperation({
    summary: 'Получить Дочерние Реакции по ID Родительской Реакции',
  })
  async findChildReactions(
    @Param('parentId') parentId: number,
  ): Promise<ReactionEntity[]> {
    this.logger.debug(`req < Child по React.parentId '${parentId}'`);
    return this.reactionsService.findChildReactions(+parentId);
  }

  @Get('/parent-reaction/:childId')
  @ApiOperation({
    summary: 'Получить Родительскую Реакцию по ID Дочерней Реакции',
  })
  async findParentReaction(
    @Param('childId') childId: number,
  ): Promise<ReactionEntity> {
    this.logger.debug(`req < Parent по React.childId '${childId}`);
    return this.reactionsService.findParentReaction(+childId);
  }

  // мтд.получ.Реакции по связи Сущности/ID
  @Get('/entity/:entityType/:entityId/')
  @ApiOperation({ summary: 'Получить Реакции по Сущности/ID + Дети/Связи' })
  // параметры выбора: Тип/ID (из Param стр.)
  @ApiParam({
    name: 'entityType',
    enum: ['file', 'track', 'album'],
    required: true,
    description: 'Тип сущности (file, track, album)',
  })
  @ApiParam({
    name: 'entityId',
    required: true,
    description: 'ID сущности',
  })
  // опцион.вкл.параметры (из стр.req)
  @ApiQuery({
    name: 'includedParams',
    enum: ['childs', 'relationId', 'relationFull'],
    isArray: true,
    required: false,
    description: 'Включены параметры (Дети, ID Cвязи <> Полная Связь)',
  })
  async findReactionsByEntity(
    // параметры выбора: Тип/ID (из Param стр.)
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number,
    // опцион.вкл.параметры (из стр.req)
    @Query('includedParams')
    includedParams?: string | string[],
  ): Promise<ReactionEntity[]> {
    this.logger.debug(`req << React Entity '${entityType}' с ID '${entityId}'`);
    return this.reactionsService.findReactionsByEntity(
      entityId,
      entityType,
      includedParams,
    );
  }
}
