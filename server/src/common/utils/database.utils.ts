// ^^ различные/помошники Утилиты База Данных
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Optional } from '@nestjs/common';

import { UserEntity } from '../../modules/users/entities/user.entity';
import { RoleEntity } from '../../modules/roles/entities/role.entity';
import { FileEntity } from '../../modules/files/entities/file.entity';
import { TrackEntity } from '../../modules/tracks/entities/track.entity';
import { AlbumEntity } from '../../modules/albums/entities/album.entity';
// константы > команды запуска
// import {
//   isProduction,
//   isDevelopment,
//   isTotal,
// } from '../config/envs/env.consts';

@Injectable()
export class DatabaseUtils {
  constructor(
    @Optional()
    @InjectRepository(UserEntity, 'supabase')
    private userRepositorySB: Repository<UserEntity>,
    @Optional()
    @InjectRepository(RoleEntity, 'supabase')
    private rolesRepositorySB: Repository<RoleEntity>,
    @Optional()
    @InjectRepository(TrackEntity, 'supabase')
    private trackRepositorySB: Repository<TrackEntity>,
    @Optional()
    @InjectRepository(FileEntity, 'supabase')
    private fileRepositorySB: Repository<FileEntity>,
    @Optional()
    @InjectRepository(AlbumEntity, 'supabase')
    private albumRepositorySB: Repository<AlbumEntity>,
    //
    // @Optional()
    // @InjectRepository(UserEntity, isProduction ? 'supabase' : 'localhost')
    // private userRepositorySB: Repository<UserEntity>,
    // private userRepository: Repository<UserEntity>,
    // private userRepository`${isProduction} ? 'supabase' : 'localhost'`: Repository<UserEntity>,
    //
    @Optional()
    @InjectRepository(UserEntity, 'localhost')
    private userRepository?: Repository<UserEntity>,
    @Optional()
    @InjectRepository(RoleEntity, 'localhost')
    private rolesRepository?: Repository<RoleEntity>,
    @Optional()
    @InjectRepository(TrackEntity, 'localhost')
    private trackRepository?: Repository<TrackEntity>,
    @Optional()
    @InjectRepository(FileEntity, 'localhost')
    private fileRepository?: Repository<FileEntity>,
    @Optional()
    @InjectRepository(AlbumEntity, 'localhost')
    private albumRepository?: Repository<AlbumEntity>,
  ) {}

  // `получить наименьший доступный идентификатор` из БД > табл.указ.в tableName
  async getSmallestIDAvailable(tableName: string): Promise<number> {
    // перем.Репозитория
    let customRepository: Repository<any>;
    // опред.Репозитория
    if (tableName === 'user') customRepository = this.userRepository;
    if (tableName === 'role') customRepository = this.rolesRepository;
    if (tableName === 'file') customRepository = this.fileRepository;
    if (tableName === 'track') customRepository = this.trackRepository;
    if (tableName === 'album') customRepository = this.albumRepository;
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
