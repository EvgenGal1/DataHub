import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import { isProduction, isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class RolesService {
  constructor(
    private readonly logger: LoggingWinston,
    @InjectRepository(RoleEntity, process.env.DB_HOST)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly basicUtils: BasicUtils,
    private readonly dataBaseUtils: DatabaseUtils,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    try {
      if (isDevelopment)
        this.logger.info(`db + Role : '${JSON.stringify(createRoleDto)}'`);

      // `получить наименьший доступный идентификатор` из БД > табл.role
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('role');
      // объ.track созд./сохр./вернуть
      const roleCre = this.roleRepository.create({
        ...createRoleDto,
        id: smallestFreeId,
      });
      if (!roleCre) {
        this.logger.warn(`Role '${JSON.stringify(createRoleDto)}' не создан`);
        throw new NotFoundException(
          `Role '${JSON.stringify(createRoleDto)}' не создан`,
        );
      }

      // сохр.,ошб.,лог.,возврат
      const savedRole: RoleEntity = await this.roleRepository.save(roleCre);
      if (!savedRole) {
        this.logger.warn(`Role '${JSON.stringify(createRoleDto)}' не сохранён`);
        throw new NotFoundException(
          `Role '${JSON.stringify(createRoleDto)}' не сохранён`,
        );
      }
      this.logger.debug(`+ Role.ID '${savedRole.id}'`);
      return savedRole;
    } catch (error) {
      this.logger.error(
        `!Ошб. + Role: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `'rol.s. CRE : DTO '${JSON.stringify(createRoleDto)}'`,
        );
      throw error;
    }
  }

  async findAllRoles(): Promise<RoleEntity[]> {
    try {
      if (isDevelopment) this.logger.info(`db << Roles All`);
      const allRoles = await this.roleRepository.find();
      if (!allRoles) {
        this.logger.warn(`Roles All не найден`);
        throw new NotFoundException(`Roles All не найден`);
      }
      this.logger.debug(
        `<< Roles All length '${allRoles?.length}' < БД '${
          isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'
        }'`,
      );
      return allRoles;
    } catch (error) {
      this.logger.error(
        `!Ошб. << Roles: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ОДИН по id
  async findOneRole(id: number): Promise<RoleEntity> {
    try {
      if (isDevelopment) this.logger.info(`db < Role.ID '${id}'`);
      const role = await this.roleRepository.findOneBy({ id });
      if (!role) {
        this.logger.warn(`Role.ID '${id}' не найдена`);
        throw new NotFoundException(`Role.ID '${id}' не найдена`);
      }
      this.logger.debug(`< Role.ID '${role?.id}'`);
      return role;
    } catch (error) {
      this.logger.error(
        `!Ошб. < Role.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // Получить Роль по ID <> Значению
  async findRoleByValue(value: string): Promise<RoleEntity> {
    try {
      if (isDevelopment) this.logger.info(`db <? Role Value '${value}'`);

      const whereCondition: any = {};
      // условия res. id/num|value/str
      if (typeof value === 'number' || !isNaN(parseFloat(value)))
        whereCondition.id = value;
      else whereCondition.value = value;

      // объ.res, обраб.ошб., res по значени.
      const role = await this.roleRepository.findOne({ where: whereCondition });
      if (!role) {
        this.logger.warn(`Role Value '${value}' не найдена`);
        throw new NotFoundException('Такой Роли нет');
      }
      this.logger.debug(`<? Role Value '${value}'`);
      return role;
    } catch (error) {
      this.logger.error(
        `!Ошб. <? Role Value '${value}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  async updateRole(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    try {
      if (isDevelopment)
        this.logger.info(
          `db + Role.ID '${id}' | DTO '${JSON.stringify(updateRoleDto)}'`,
        );

      const role = await this.roleRepository.findOneBy({ id });
      if (!role) {
        this.logger.warn(`Role.ID '${id}' не найдена`);
        throw new NotFoundException(`Role.ID '${id}' не найдена`);
      }

      // role.value = updateRoleDto.value;
      // role.description = updateRoleDto.description;
      Object.assign(role, updateRoleDto);

      const rolUpd = await this.roleRepository.save(role);

      if (!rolUpd) {
        this.logger.warn(
          `Role.ID '${id}' по DTO '${JSON.stringify(updateRoleDto)}' не обновлён`,
        );
        throw new NotFoundException(
          `Role.ID '${id}' по DTO '${JSON.stringify(updateRoleDto)}' не обновлён`,
        );
      }
      this.logger.debug(`# Role.ID '${rolUpd.id}'`);
      return rolUpd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # Role: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `rol.s. UPD : Role.ID '${id}' | DTO '${JSON.stringify(updateRoleDto)}'`,
        );
      throw error;
    }
  }

  // пометка Удаления
  async removeRole(id: number) {
    try {
      if (isDevelopment) this.logger.info(`db - Role.ID: '${id}'`);
      const rolRem = await this.roleRepository.softDelete(id);
      if (!rolRem) {
        this.logger.warn(`Role.ID '${id}' не удалён`);
        throw new NotFoundException(`Role.ID '${id}' не удалён`);
      }
      this.logger.debug(`- Role.ID : '${rolRem}'`);
      return rolRem;
    } catch (error) {
      this.logger.error(
        `!Ошб. - Role.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // востановить
  // async restoreRole(id: number|string) {
  //   return await this.roleRepository.restore(id);
  // }

  // Удаление Полное
  async deleteRole(
    roleIds: string | number,
    roleId?: number,
    // totalRoleDto?: TotalRoleDto,
    param?: string,
  ) {
    try {
      if (!roleIds) {
        this.logger.warn('Нет Роли/ей > Удаления');
        throw new NotFoundException('Нет Роли/ей > Удаления');
      }
      if (!roleId && !param /* && !totalRoleDto */) {
        this.logger.warn('Предовращено полное удаление Роли/ей');
        throw new NotFoundException('Предовращено полное удаление Роли/ей');
      }
    } catch (error) {
      this.logger.error(
        `!Ошб. - Role.ID '${roleIds}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ^ ДОП.МТД. -----------------------------------------------------------------------
  // ^ МТД. > ADMIN -----------------------------------------------------------------------
  // добавить неск.Ролей к неск.Пользователям
  // async addingRolesToUsers(
  //   addingRolesToUsersDto: AddingRolesToUsersDto,
  // ): Promise<void> {
  //   try {
  //     const { userIds, roleIds } = addingRolesToUsersDto;
  //     // проверки и приведение к общ.типу
  //     const userIdss: string | string[] = userIds.includes(',')
  //       ? userIds.split(',')
  //       : userIds;
  //     const roleIdss: string | string[] = roleIds.includes(',')
  //       ? roleIds.split(',')
  //       : roleIds;
  //     // получ.данн. User и Role
  //     const users = await this.userRepository.findBy({ id: In([...userIdss]) });
  //     if (!users) {
  //       this.logger.error(`User.userIdss '${userIdss}' не нейдены`);
  //       throw new NotFoundException(`User.userIdss '${userIdss}' не нейдены`);
  //     }
  //     const roles = await this.roleRepository.findBy({ id: In([...roleIdss]) });
  //     if (!users) {
  //       this.logger.error(`Role.roleIdss '${roleIdss}' не нейдены`);
  //       throw new NotFoundException(`Role.roleIdss '${roleIdss}' не нейдены`);
  //     }
  //     // Проверка существования пользователей и ролей
  //     if (
  //       users.length !== userIdss.length ||
  //       roles.length !== roleIdss.length
  //     ) {
  //       this.logger.error(
  //         'Одного или нескольких пользователей или ролей не существует.',
  //       );
  //       throw new NotFoundException(
  //         'Одного или нескольких пользователей или ролей не существует.',
  //       );
  //     }
  //     // Создание связей между Пользователями и Ролями
  //     for (const user of users) {
  //       for (const role of roles) {
  //         const userRoles = new UserRolesEntity();
  //         userRoles.userId = user.id;
  //         userRoles.roleId = role.id;
  //         await this.userRolesRepository.save(userRoles);
  //       }
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `!Ошб. + AVA User > Role '${JSON.stringify(addingRolesToUsersDto)}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
  //     );
  //     throw error;
  //   }
  // }
}
