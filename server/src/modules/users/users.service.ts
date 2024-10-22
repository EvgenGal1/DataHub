/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { AddingRolesToUsersDto } from '../roles/dto/add-roles-to-users.dto';
// утилиты Общие
import { BasicUtils } from '../../common/utils/basic.utils';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';
// константы > команды запуска process.env.NODE_ENV
import { isProduction, isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class UsersService {
  constructor(
    // логгер
    private readonly logger: LoggingWinston,
    // ч/з внедр.завис. + UserEntity и др. > раб.ч/з this с табл.users и др.
    // ^ подкл.БД от NODE_ENV. PROD(SB) <> DEV(LH)
    @InjectRepository(UserEntity, isProduction ? 'supabase' : 'localhost')
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity, isProduction ? 'supabase' : 'localhost')
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRolesEntity, isProduction ? 'supabase' : 'localhost')
    private userRolesRepository: Repository<UserRolesEntity>,
    // ^ доп.репозит.настр.
    private roleService: RolesService,
    private dataBaseUtils: DatabaseUtils,
    private basicUtils: BasicUtils,
  ) {}

  // ^ МТД.CRUD

  // СОЗД User + Role + связь
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      // `получить наименьший доступный идентификатор` из БД > табл.users
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('user');
      // созд.репоз. / обраб.ошб.
      const user = this.userRepository.create({
        ...createUserDto,
        id: smallestFreeId,
      });
      if (!user)
        throw new NotFoundException(
          `User ${JSON.stringify(createUserDto)} не создан`,
        );

      // ^ будущ.запись Роли,Уровень Роли,psw,token и др.

      // log > DEV
      if (isDevelopment)
        this.logger.info(`db + User : ${JSON.stringify(createUserDto)}`);
      // сохр.,ошб.,лог.,возврат
      const savedUser: UserEntity = await this.userRepository.save(user);
      if (!savedUser)
        throw new NotFoundException(
          `User ${JSON.stringify(createUserDto)} не сохранён`,
        );
      this.logger.info(`+ User.ID ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(
        `!Ошб. + User: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          'usr.s. CRE createUserDto : ',
          createUserDto,
        );
      throw error;
    }
  }

  // все users из БД
  async findAllUsers(): Promise<UserEntity[]> {
    try {
      if (isDevelopment) this.logger.info(`db << User All`);
      const allUsers = await this.userRepository.find();
      if (!allUsers) throw new NotFoundException(`User All не найден`);
      this.logger.info(
        `<< Users All length ${allUsers?.length} < БД ${
          isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'
        }`,
      );
      return allUsers;
    } catch (error) {
      this.logger.error(
        `!Ошб. << Users: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // ОДИН по id
  async findOneUser(id: number): Promise<UserEntity> {
    try {
      if (isDevelopment) this.logger.info(`db < User.ID ${id}`);
      const user = await this.userRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User.ID ${id} не найден`);
      this.logger.info(`< User.ID ${user?.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `!Ошб. < User.ID ${id}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // ОДИН user.по параметрам ID <> Email <> FullName
  // ! переделать под получ roles tracks user_roles в завис.от парам. и пр.
  async findUserByParam(param: string) {
    try {
      if (isDevelopment) this.logger.info(`db <? User.Param : ${param}`);
      // ^^ fn для неск.id
      // if (usersIds) {
      //   const splitUserIds = usersIds.split(',');
      //   return this.userRepository./* findAndCount */ find({
      //     where: { id: In(splitUserIds) },
      //     // relations: {
      //     //   /* roles */ userRoles: true,
      //     // },
      //   });
      // }
      // return this.userRepository.find();

      // ^^ мтд.напрямую
      // const users = await this.userRepository.find({
      //   relations: ['roles', 'tracks', 'user_roles'],
      // });

      // ^^ мтд.ч/з `созд. строитель запросов`
      // const users = await this.userRepository
      //   .createQueryBuilder('user')
      //   .leftJoinAndSelect('user.roles', 'role')
      //   // ! дораб.
      //   .leftJoinAndSelect('role.user_roles', 'level')
      //   .getMany();

      const whereCondition: any = {};
      // условия res. id/num|eml/@|fullname/str // ^^ дораб.распозн.eml ч/з регул.выраж.
      if (!isNaN(Number(param))) {
        whereCondition.id = param;
      } else if (param.includes('@')) {
        whereCondition.email = param;
      } else if (!param.includes('@') && typeof param === 'string') {
        whereCondition.fullname = param;
      }

      const user = await this.userRepository.findOne({ where: whereCondition });
      if (!user) throw new NotFoundException(`User по ${param} не найден`);
      this.logger.info(`<? User.Param : ${param}`);
      return user;
    } catch (error) {
      this.logger.error(
        `!Ошб. <? User.Param ${param}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // мтд.обновить
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    try {
      // получ.user.id / обраб.ошб.
      const user = await this.userRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User.ID ${id} не найден`);

      // изменения
      user.fullname = updateUserDto.fullname;
      user.email = updateUserDto.email;
      // user.password = updateUserDto.password;

      // log > DEV
      if (isDevelopment)
        this.logger.info(
          `db # User ${await this.basicUtils.hendlerTypesErrors(user)}`,
        );

      // сохр.,ошб.,лог.,возврат
      const usrUpd = await this.userRepository.save(user);
      if (!usrUpd)
        throw new NotFoundException(
          `User.ID ${id} по данным ${JSON.stringify(updateUserDto)} не обновлён`,
        );
      this.logger.info(`# User.ID : ${usrUpd.id}`);
      return usrUpd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # User: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          'usr.s. UPD Param - id | updateUserDto :  ',
          id,
          updateUserDto,
        );
      throw error;
    }
  }

  // пометка Удаления
  async removeUser(id: number) {
    try {
      if (isDevelopment) this.logger.info(`db - User.ID: ${id}`);
      const usrRem = await this.userRepository.softDelete(id);
      if (!usrRem) throw new NotFoundException(`User.ID ${id} не удалён`);
      this.logger.info(`- User.ID : ${usrRem}`);
      return usrRem;
    } catch (error) {
      this.logger.error(
        `!Ошб. - User.ID ${id}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // востановить
  // async restoreUser(id: number|string) {
  //   return await this.userRepository.restore(id);
  // }

  // Удаление
  async deleteUser(
    userIds: string | number,
    userId?: number,
    // totalUserDto?: TotalUserDto,
    param?: string,

    // востановить
  ) {
    try {
      // ошб.е/и нет ID
      if (!userIds) {
        throw new NotFoundException('Нет Пользователя/ей > Удаления');
      }
      if (!userId && !param /* && !totalUserDto */) {
        throw new NotFoundException(
          'Предовращено полное удаление Пользователя/ей',
        );
      }
    } catch (error) {
      this.logger.error(
        `!Ошб. - User.ID ${userIds}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // ^ ДОП.МТД. ----------------------------------------------------------------------------------
  // !! https://www.techiediaries.com/nestjs-upload-serve-static-file/
  // обнов.аватар Пользователя
  public async setAvatar(userId: number, avatarUrl: string) {
    try {
      if (isDevelopment)
        this.logger.info(`db + AVA ${avatarUrl} > User.ID: ${userId}`);

      const avaAdd = await this.userRepository.update(userId, {
        avatar: avatarUrl,
      });
      if (!avaAdd)
        throw new NotFoundException(
          `User.ID ${userId} AVA ${avatarUrl} не добавлена`,
        );
      this.logger.info(`# User.ID ${userId} AVA ${avatarUrl}`);
      return avaAdd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # AVA User.ID ${userId}: ${await this.basicUtils.hendlerTypesErrors(error)}`,
      );
      throw error;
    }
  }

  // ^ МТД. > ADMIN ----------------------------------------------------------------------------------
  // добавить неск.Ролей к неск.Пользователям
  async addingRolesToUsers(
    addingRolesToUsersDto: AddingRolesToUsersDto,
  ): Promise<void> {
    try {
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
      if (!users)
        throw new NotFoundException(`User.userIdss ${userIdss} не нейдены`);
      const roles = await this.roleRepository.findBy({ id: In([...roleIdss]) });
      if (!users)
        throw new NotFoundException(`Role.roleIdss ${roleIdss} не нейдены`);
      // Проверка существования пользователей и ролей
      if (users.length !== userIdss.length || roles.length !== roleIdss.length)
        throw new NotFoundException(
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
    } catch (error) {}
  }

  // ^^ Расшир.мтд. ----------------------------------------------------------------------------
  // ~~ получить level из user_roles
  // async getUserRolesLevel(userId: number): Promise<number[]> {
  //   const queryResult = await this.userRepository
  //     .createQueryBuilder('user')
  //     .leftJoin('user.roles', 'roles')
  //     .select('roles.level', 'level')
  //     .where('user.id = :userId', { userId })
  //     .getRawMany();

  //   const levels = queryResult.map((result) => result.level);
  //   return levels;
  // }
  // ~~ связь с конкретными ролями
  // async createUserWithRoles(
  //   username: string,
  //   roleNames: string[],
  // ): Promise<UserEntity> {
  //   const newUser = new UserEntity();
  //   newUser.username = username;
  //   // ... добавление других свойств пользователя
  //   // ...

  //   // Сохранение нового пользователя
  //   const savedUser = await this.userRepository.save(newUser);

  //   // Получение ролей из базы данных, например, по массиву названий ролей
  //   const roles = await this.roleRepository.find({
  //     where: { role: roleNames },
  //   });

  //   // Создание связи между пользователем и ролями в user_roles
  //   const userRoles = roles.map((role) => {
  //     const userRole = new UserRolesEntity();
  //     userRole.user = savedUser;
  //     userRole.role = role;
  //     return userRole;
  //   });

  //   // Сохранение связей в user_roles
  //   await this.userRolesRepository.save(userRoles);

  //   // Вернуть созданного пользователя с ролями
  //   savedUser.roles = roles;
  //   return savedUser;
  // }
  //  ----------------------------------------------------------------------------------
  // ~~ Для получения пользователя (user), его роли (role) и уровня (level) из таблиц users, roles и user_roles
  // async getUserRoleAndLevel(userId: number): Promise<any> {
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     relations: ['userRoles', 'userRoles.role'],
  //   });
  //   console.log('user : ' + user);
  //   console.log(user);

  //   if (user) {
  //     const roles = user.roles.map((userRole) => {
  //       console.log(userRole);
  //       userRole.value;
  //     });
  //     console.log(roles);
  //   }

  // Получение роли и уровня для пользователя
  // const role = user.roles[0]; // Предполагается, что у пользователя есть только одна роль
  // const level = role.userRoles.level; // Предполагается, что у роли есть только один уровень

  // Создание объекта с информацией о пользователе, роли и уровне
  // const userInfo = {
  //   user,
  //   role,
  //   level,
  // };

  // return userInfo;
  // }
}
