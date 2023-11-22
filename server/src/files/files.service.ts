import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { FileType, FileEntity } from './entities/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {}

  // ^^ UlbiTV
  // createFile(type: FileType, file): string {
  //   try {
  //     const fileExtension = file.originalname.split('.').pop();
  //     const fileName = uuid.v4() + '.' + fileExtension;
  //     const filePath = path.resolve(__dirname, '..', 'static', type);
  //     if (!fs.existsSync(filePath)) {
  //       fs.mkdirSync(filePath, { recursive: true });
  //     }
  //     fs.writeFileSync(path.resolve(filePath, fileName), file.buffer);
  //     return type + '/' + fileName;
  //   } catch (e) {
  //     throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
  // // удал.ф.
  // // ^^ eslint-disable-next-line от ошб. - 'fileName' is defined but never used(`опред.но не использ.`)
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // removeFile(fileName: string) {}

  create(file: Express.Multer.File, userId: number) {
    // инфо о ф.сохр.в БД для опред.user
    return this.repository.save({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      user: { id: userId },
    });
  }

  // мтд.получ.всех ф. // возвращ.ф.опред.user и с опред.типом(декор.Query)
  findAll(userId: number, fileType: FileType) {
    // генер.спец. SQL req ч/з `Создать строитель запросов`
    const qb = this.repository.createQueryBuilder('file');

    // наход.ф.где id user совпад.с передан.в парам.
    qb.where('file.userId = :userId', { userId });

    // е/и тип ф. === фото
    if (fileType == FileType.PHOTOS) {
      // возвращ.ф.с mimetype = image
      qb.andWhere('file.mimetype ILIKE :type', { type: '%image%' });
    }

    // е/и тип ф. === `мусор`
    if (fileType == FileType.TRASH) {
      // возвращ.ф.с пометкой удалён
      qb.withDeleted().andWhere('file.deletedAt IS NOT NULL');
    }

    // возвращ.ф. по генер.спец.req
    return qb.getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(userId: number, ids: string) {
    // превращ.ids ф.в масс.
    const idsArray = ids.split(',');

    // генер.спец. SQL req ч/з `Создать строитель запросов`
    const qb = this.repository.createQueryBuilder('files');

    // наход.ф.по ids И userId
    qb.where('id IN (:...ids) AND userId = :userId', {
      ids: idsArray,
      userId,
    });

    // пометка `мягк.удал.`ф.
    return qb.softDelete().execute();
  }
}
