import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  // подкл.FileEntity ч/з TypeOrmModule в import для раб.с табл.files
  imports: [TypeOrmModule.forFeature([FileEntity])],
})
export class FilesModule {}
