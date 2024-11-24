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
    this.logger.info(
      `req + Reaction DTO : '${JSON.stringify(createReactionDto)}'`,
    );
    return this.reactionsService.createReaction(createReactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить Все Реакции' })
  async findAllReaction() {
    this.logger.info(`req << Reacts All`);
    return this.reactionsService.findAllReaction();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить Реакцию' })
  async findOneReaction(@Param('id') id: number) {
    this.logger.info(`req < React.ID '${id}'`);
    return this.reactionsService.findOneReaction(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить Реакцию' })
  async updateReaction(
    @Param('id') id: number,
    @Body() updateReactionDto: UpdateReactionDto,
  ) {
    this.logger.info(`req # React.ID '${id}'`);
    return this.reactionsService.updateReaction(+id, updateReactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить Реакцию' })
  async removeReaction(@Param('id') id: number) {
    this.logger.info(`req - React.ID '${id}'`);
    return this.reactionsService.removeReaction(+id);
  }

  // ^^ Расшир.мтд. ----------------------------------------------------------------------------

  @Get('/child-reactions/:parentId')
  @ApiOperation({
    summary: 'Получить Дочерние Реакции по ID Родительской Реакции',
  })
  async findChildReactions(
    @Param('parentId') parentId: string,
  ): Promise<ReactionEntity[]> {
    return this.reactionsService.findChildReactions(+parentId);
  }

  @Get('/parent-reaction/:childId')
  @ApiOperation({
    summary: 'Получить Родительскую Реакцию по ID Дочерней Реакции',
  })
  async findParentReaction(
    @Param('childId') childId: string,
  ): Promise<ReactionEntity> {
    return this.reactionsService.findParentReaction(+childId);
  }

  // мтд.получ.Реакции по связи Сущности/ID
  @Get('/entity/:entityType/:entityId/')
  @ApiOperation({ summary: 'Получить Реакции по Сущности/ID + Дети/Связи' })
  // параметры выбора: Тип/ID (из Param стр.)
  @/* ApiQuery */ ApiParam({
    name: 'entityType',
    enum: ['file', 'track', 'album'],
    required: true,
    description: 'Тип сущности (file, track, album)',
  })
  @/* ApiQuery */ ApiParam({
    name: 'entityId',
    required: true,
    description: 'ID сущности',
  })
  // опцион.вкл.параметры
  @ApiQuery({
    name: 'includedParams',
    enum: ['childs', 'relationId', 'relationFull'],
    isArray: true,
    required: false,
    description: 'Включены параметры (Дети, ID Cвязи <> Полная Связь)',
  })
  async findByEntity(
    // параметры выбора: Тип/ID (из Param стр.)
    @/* Query */ Param('entityType') entityType: string,
    @/* Query */ Param('entityId') entityId: number,
    // опцион.вкл.параметры
    @Query('includedParams')
    includedParams?: string | string[],
  ): Promise<ReactionEntity[]> {
    this.logger.info(`req << React Entity '${entityType}' с ID '${entityId}'`);
    return this.reactionsService.findByEntity(
      entityId,
      entityType,
      includedParams,
    );
  }
}
