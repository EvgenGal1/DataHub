import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRolesEntity } from './entities/user-roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRolesEntity)
    private userRolesRepository: Repository<UserRolesEntity>,
  ) {}

  // `получить наименьший доступный идентификатор`
  async getSmallestAvailableId(tableName: string): Promise<number> {
    let customRepository: any;
    // опред.репозитор.
    if (tableName === 'role') customRepository = this.roleRepository;
    // обраб.ошб.е/и табл.нет
    if (!customRepository) throw new Error('Неверное название таблицы');
    // состав.req к табл.tableName по id и по порядку возрастания
    const query = customRepository
      .createQueryBuilder(tableName)
      .select(`${tableName}.id`, 'id')
      .orderBy(`${tableName}.id`, 'ASC')
      .getRawMany();
    // req к БД и перем.сравн.в нач.знач.1
    const result = await query;
    let firstAvailableId = 1;
    // перебор result, сравн.id с нач.знач., увелич.на 1 е/и =, возврт. е/и !=
    for (const row of result) {
      const currentId = parseInt(row.id);
      if (currentId !== firstAvailableId) break;
      firstAvailableId++;
    }
    // возврат измен.нач.знач. е/и != track.id
    return firstAvailableId;
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const smallestFreeId = await this.getSmallestAvailableId('role');
    const role = this.roleRepository.create({
      ...createRoleDto,
      id: smallestFreeId,
    });
    return await this.roleRepository.save(role);
  }

  async findAllRoles() {
    return await this.roleRepository.find();
  }

  async findRoleByValue(value: string) {
    const whereCondition: any = {};
    // условия res. id/num|value/str
    if (
      typeof value === 'number' ||
      (typeof value === 'string' && !isNaN(parseFloat(value)))
    ) {
      whereCondition.id = value;
    } else {
      whereCondition.value = value;
    }
    // объ.res, обраб.ошб., res по значени.
    const role = await this.roleRepository.findOne({ where: whereCondition });
    if (!role) throw new Error('Такой Роли нет');
    return role;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new Error('Роль не найдена');
    role.value = updateRoleDto.value;
    role.description = updateRoleDto.description;
    return this.roleRepository.save(role);
  }

  async removeRole(id: number) {
    return await this.roleRepository.softDelete(id);
  }
  // async restoreRole(id: number) {
  //   return await this.roleRepository.restore(id);
  // }
}
