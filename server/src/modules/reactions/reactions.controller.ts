import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
}
