// ^^ различные/помошники Утилиты База Данных
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { AuthEntity } from '../../modules/auth/entities/auth.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { UserRolesEntity } from '../../modules/roles/entities/user-roles.entity';
import { FileEntity } from '../../modules/files/entities/file.entity';
import { TrackEntity } from '../../modules/tracks/entities/track.entity';
import { AlbumEntity } from '../../modules/albums/entities/album.entity';
import { ReactionEntity } from '../../modules/reactions/entities/reaction.entity';

@Injectable()
export class DatabaseUtils {
  constructor(
    // ч/з внедр.завис. + UserEntity и др. > раб.ч/з this с табл.users и др.
    // подкл.2 БД от NODE_ENV. PROD(SB) <> DEV(LH)
    @InjectRepository(AuthEntity, process.env.DB_NAM)
    private readonly authRepository?: Repository<AuthEntity>,
    @InjectRepository(UserEntity, process.env.DB_NAM)
    private readonly userRepository?: Repository<UserEntity>,
    @InjectRepository(RoleEntity, process.env.DB_NAM)
    private readonly rolesRepository?: Repository<RoleEntity>,
    @InjectRepository(UserRolesEntity, process.env.DB_NAM)
    private readonly userRolesRepository?: Repository<UserRolesEntity>,
    @InjectRepository(TrackEntity, process.env.DB_NAM)
    private readonly trackRepository?: Repository<TrackEntity>,
    @InjectRepository(FileEntity, process.env.DB_NAM)
    private readonly fileRepository?: Repository<FileEntity>,
    @InjectRepository(AlbumEntity, process.env.DB_NAM)
    private readonly albumRepository?: Repository<AlbumEntity>,
    @InjectRepository(ReactionEntity, process.env.DB_NAM)
    private readonly reactionRepository?: Repository<ReactionEntity>,
  ) {}

  // `получить наименьший доступный идентификатор` из БД > табл.указ.в tableName
  async getSmallestIDAvailable(tableName: string): Promise<number> {
    // перем.Репозитория
    let customRepository: Repository<any>;
    // опред.Репозитория
    if (tableName === 'auth') customRepository = this.authRepository;
    if (tableName === 'user') customRepository = this.userRepository;
    if (tableName === 'role') customRepository = this.rolesRepository;
    if (tableName === 'userRole') customRepository = this.userRolesRepository;
    if (tableName === 'file') customRepository = this.fileRepository;
    if (tableName === 'track') customRepository = this.trackRepository;
    if (tableName === 'album') customRepository = this.albumRepository;
    if (tableName === 'react') customRepository = this.reactionRepository;
    // обраб.ошб.е/и табл.нет
    if (!customRepository) throw new Error('Неверное название таблицы');
    // составной req
    const query = customRepository
      .createQueryBuilder(tableName)
      .withDeleted()
      .select(`${tableName}.id`, 'id')
      .orderBy(`${tableName}.id`, 'ASC')
      .getRawMany();
    // req
    const result = await query;
    // перем. начального доступного ID
    let firstAvailableId = 1;
    // перебор./сравн. ID начал. <> ID БД
    for (const row of result) {
      const currentId = parseInt(row.id);
      if (currentId !== firstAvailableId) break;
      firstAvailableId++;
    }
    console.log(
      'help.db SmallestID table | ID : ',
      tableName,
      firstAvailableId,
    );
    // возврат первого свободного ID
    return firstAvailableId;
  }
}
