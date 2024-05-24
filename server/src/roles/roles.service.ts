import { In, Repository } from 'typeorm';
import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserEntity } from '../users/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRolesEntity } from './entities/user-roles.entity';
import { AddingRolesToUsersDto } from './dto/add-roles-to-users.dto';
import { DatabaseUtils } from '../utils/database.utils';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserEntity, 'supabase')
    private userRepositorySB: Repository<UserEntity>,
    @InjectRepository(RoleEntity, 'supabase')
    private roleRepositorySB: Repository<RoleEntity>,
    @InjectRepository(UserRolesEntity, 'supabase')
    private userRolesRepositorySB: Repository<UserRolesEntity>,
    //
    private dataBaseUtils: DatabaseUtils,
    //
    @Optional()
    @InjectRepository(UserEntity, 'localhost')
    private userRepository?: Repository<UserEntity>,
    @Optional()
    @InjectRepository(RoleEntity, 'localhost')
    private roleRepository?: Repository<RoleEntity>,
    @Optional()
    @InjectRepository(UserRolesEntity, 'localhost')
    private userRolesRepository?: Repository<UserRolesEntity>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    // `получить наименьший доступный идентификатор` из БД > табл.role
    const smallestFreeId =
      await this.dataBaseUtils.getSmallestIDAvailable('role');
    // объ.track созд./сохр./вернуть
    const role = this.roleRepository.create({
      ...createRoleDto,
      id: smallestFreeId,
    });
    await this.roleRepository.save(role);
    return role;
  }

  async findAllRoles() {
    return await this.roleRepository.find();
  }

  // Получить Роль по ID <> Значению
  async findRoleByValue(value: string) {
    const whereCondition: any = {};
    // условия res. id/num|value/str
    if (typeof value === 'number' || !isNaN(parseFloat(value)))
      whereCondition.id = value;
    else whereCondition.value = value;
    // объ.res, обраб.ошб., res по значени.
    const role = await this.roleRepository.findOne({ where: whereCondition });
    // обраб.отсутствие Роли
    if (!role) throw new NotFoundException('Такой Роли нет');
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

  // ^^ мтд.> ADMIN
  // добавить неск.Ролей к неск.Пользователям
  async addingRolesToUsers(
    addingRolesToUsersDto: AddingRolesToUsersDto,
  ): Promise<void> {
    const { userIds, roleIds } = addingRolesToUsersDto;
    // проверки и приведение к общ.типу
    const userIdss: string | string[] = userIds.includes(',')
      ? userIds.split(',')
      : userIds;
    const roleIdss: string | string[] = roleIds.includes(',')
      ? roleIds.split(',')
      : roleIds;
    // получ.данн. User и Role
    const users = await this.userRepository.findBy({ id: In([...userIdss]) });
    const roles = await this.roleRepository.findBy({ id: In([...roleIdss]) });
    // Проверка существования пользователей и ролей
    if (users.length !== userIdss.length || roles.length !== roleIdss.length)
      throw new Error(
        'Одного или нескольких пользователей или ролей не существует.',
      );

    // Создание связей между Пользователями и Ролями
    for (const user of users) {
      for (const role of roles) {
        const userRoles = new UserRolesEntity();
        userRoles.userId = user.id;
        userRoles.roleId = role.id;
        await this.userRolesRepository.save(userRoles);
      }
    }
  }
}
