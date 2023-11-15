import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // Query,
} from '@nestjs/common';
import { ObjectId } from 'typeorm';

import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
// import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('/tracks')
// групп.мтд.cntrl tracks > swagger
// @ApiTags('tracks')
// сообщ.о защищены req jwt Токеном > swagger
// @ApiBearerAuth()
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post()
  //   @UseInterceptors(FileFieldsInterceptor([
  //     { name: 'picture', maxCount: 1 },
  //     { name: 'audio', maxCount: 1 },
  // ]))
  create(/* @UploadedFiles() files, */ @Body() createTrackDto: CreateTrackDto) {
    // const {picture, audio} = files
    return this.trackService.create(
      createTrackDto /* , picture[0], audio[0] */,
    );
  }

  @Get()
  findAll(/* @Query('count') count: number, @Query('offset') offset: number */) {
    return this.trackService.findAll(/* count, offset */);
  }

  // id получ.из param маршрута req
  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.trackService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: ObjectId, @Body() updateTrackDto: UpdateTrackDto) {
    return this.trackService.update(+id, updateTrackDto);
  }

  @Delete(':id')
  delete(@Param('id') id: ObjectId) {
    return this.trackService.delete(+id);
  }

  // @Get('/search')
  // search(@Query('query') query: string) {
  //   return this.trackService.search(query);
  // }

  // @Post('/comment')
  // addComment(@Body() dto: CreateCommentDto) {
  //   return this.trackService.addComment(dto);
  // }

  // @Post('/listen/:id')
  // listen(@Param('id') id: ObjectId) {
  //   return this.trackService.listen(id);
  // }
}
