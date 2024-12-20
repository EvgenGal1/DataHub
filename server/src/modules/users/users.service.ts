/* eslint-disable @typescript-eslint/no-unused-vars */ // ^^ от ошб. - Св-во объяв., но знач.не прочитано.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
// хеширование паролей
import bcrypt from 'bcrypt';

import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { FileEntity } from '../files/entities/file.entity';
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
    // ^ подкл.2 БД от NODE_ENV. PROD(SB) <> DEV(LH)
    @InjectRepository(UserEntity, process.env.DB_NAM)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity, process.env.DB_NAM)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRolesEntity, process.env.DB_NAM)
    private readonly userRolesRepository: Repository<UserRolesEntity>,
    @InjectRepository(FileEntity, process.env.DB_NAM)
    private readonly fileRepository: Repository<FileEntity>,
    // ^ доп.репозит.настр.
    private readonly basicUtils: BasicUtils,
    private readonly dataBaseUtils: DatabaseUtils,
  ) {}

  // ^ МТД.CRUD

  // СОЗД User + Role + связь
  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      if (isDevelopment)
        this.logger.info(`db + User DTO '${JSON.stringify(createUserDto)}'`);

      // `получить наименьший доступный идентификатор` из БД > табл.users
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('user');
      // созд.репоз. / обраб.ошб.
      const userCre: /* UserEntity */ any = /* this.userRepository.create( */ {
        ...createUserDto,
        id: smallestFreeId,
      }; /* ) */
      if (!userCre) {
        this.logger.warn(
          `User DTO '${JSON.stringify(createUserDto)}' не создан`,
        );
        throw new NotFoundException(
          `User DTO '${JSON.stringify(createUserDto)}' не создан`,
        );
      }

      // ^ будущ.запись Роли,Уровень Роли,psw,token и др.

      // сохр.,ошб.,лог.,возврат
      const savedUser: UserEntity = await this.userRepository.save(userCre);
      if (!savedUser) {
        this.logger.warn(
          `User DTO '${JSON.stringify(createUserDto)}' не сохранён`,
        );
        throw new NotFoundException(
          `User DTO '${JSON.stringify(createUserDto)}' не сохранён`,
        );
      }
      this.logger.debug(`+ User.ID '${savedUser.id}'`);
      return savedUser;
    } catch (error) {
      this.logger.error(
        `!Ошб. + User: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
        // `!Ошб. + User: ERR '${error}', detail '${error?.detail}', cod '${error?.code}'`, // ^ есть в AllExceptionsFilter
      );

      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `'usr.s. CRE : DTO '${JSON.stringify(createUserDto)}'`,
        );
      throw error;
    }
  }

  // все users из БД
  async findAllUsers(): Promise<UserDto[]> {
    try {
      if (isDevelopment) this.logger.info(`db << Users All`);

      const allUsers = await this.userRepository.find();
      if (!allUsers) {
        this.logger.warn(`Users All не найден`);
        throw new NotFoundException(`Users All не найден`);
      }
      this.logger.debug(
        `<< Users All length '${allUsers?.length}' < БД '${
          isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'
        }'`,
      );
      return allUsers;
    } catch (error) {
      this.logger.error(
        `!Ошб. << Users: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ОДИН по id
  async findOneUser(id: number): Promise<UserDto> {
    try {
      if (isDevelopment) this.logger.info(`db < User.ID '${id}'`);

      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        this.logger.warn(`User.ID '${id}' не найден`);
        throw new NotFoundException(`User.ID '${id}' не найден`);
      }
      this.logger.debug(`< User.ID '${user?.id}'`);
      return user;
    } catch (error) {
      this.logger.error(
        `!Ошб. < User.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ОДИН user.по параметрам ID <> Email <> FullName
  // ! переделать под получ roles tracks user_roles в завис.от парам. и пр.
  async findUserByParam(param: string): Promise<UserDto> {
    try {
      if (isDevelopment) this.logger.info(`db <? User Param '${param}'`);

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
      // условия res. id/num|eml/@|fullName/str // ^^ дораб.распозн.eml ч/з регул.выраж.
      if (!isNaN(Number(param))) {
        whereCondition.id = param;
      } else if (param.includes('@')) {
        whereCondition.email = param;
      } else if (!param.includes('@') && typeof param === 'string') {
        whereCondition.fullName = param;
      }

      const user = await this.userRepository.findOne({ where: whereCondition });
      if (!user) {
        this.logger.warn(`User Param '${param}' не найден`);
        throw new NotFoundException(`User Param '${param}' не найден`);
      }
      this.logger.debug(`<? User.ID '${user.id}' Param '${param}'`);
      return user;
    } catch (error) {
      this.logger.error(
        `!Ошб. <? User Param '${param}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // мтд.обновить
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    try {
      if (isDevelopment)
        this.logger.info(
          `db # User.ID '${id}' | DTO '${JSON.stringify(updateUserDto)}'`,
        );

      // получ.user.id / обраб.ошб.
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        this.logger.warn(`User.ID '${id}' не найден`);
        throw new NotFoundException(`User.ID '${id}' не найден`);
      }

      // изменения
      // user.fullName = updateUserDto.fullName;
      // user.email = updateUserDto.email;
      // // user.password = updateUserDto.password;
      // Обновляем свойства пользователя с использованием Object.assign
      Object.assign(user, updateUserDto); // Обновляем только те поля, которые указаны в DTO
      // Если необходимо, зашифруйте пароль здесь прежде, чем сохранять (если password указан)
      // if (updateUserDto.password) {
      //   user.password = await this.hashPassword(updateUserDto.password);
      // }

      // сохр.,ошб.,лог.,возврат
      const usrUpd = await this.userRepository.save(user);
      if (!usrUpd) {
        this.logger.warn(
          `User.ID '${id}' по DTO '${JSON.stringify(updateUserDto)}' не обновлён`,
        );
        throw new NotFoundException(
          `User.ID '${id}' по DTO '${JSON.stringify(updateUserDto)}' не обновлён`,
        );
      }
      this.logger.debug(`# User.ID '${usrUpd.id}'`);
      return usrUpd;
    } catch (error) {
      this.logger.error(
        `!Ошб. # User: '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      // DEV лог.debug
      if (!isProduction && isDevelopment)
        this.basicUtils.logDebugDev(
          `usr.s. UPD : User.ID '${id}' | DTO '${JSON.stringify(updateUserDto)}'`,
        );
      throw error;
    }
  }

  // пометка Удаления
  async removeUser(id: number) {
    try {
      if (isDevelopment) this.logger.info(`db - User.ID: '${id}'`);

      const usrRem = await this.userRepository.softDelete(id);
      if (!usrRem) {
        this.logger.warn(`User.ID '${id}' не удалён`);
        throw new NotFoundException(`User.ID '${id}' не удалён`);
      }
      this.logger.debug(`- User.ID : '${usrRem}'`);
      return usrRem;
    } catch (error) {
      this.logger.error(
        `!Ошб. - User.ID '${id}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // востановить
  // async restoreUser(id: number|string) {
  //   return await this.userRepository.restore(id);
  // }

  // Удаление Полное
  async deleteUser(
    userIds: string | number,
    userId?: number,
    // totalUserDto?: TotalUserDto,
    param?: string,
  ) {
    try {
      // ошб.е/и нет ID
      if (!userIds) {
        this.logger.warn('Нет Пользователя/ей > Удаления');
        throw new NotFoundException('Нет Пользователя/ей > Удаления');
      }
      if (!userId && !param /* && !totalUserDto */) {
        this.logger.warn('Предовращено полное удаление Пользователя/ей');
        throw new NotFoundException(
          'Предовращено полное удаление Пользователя/ей',
        );
      }
    } catch (error) {
      this.logger.error(
        `!Ошб. - User.ID '${userIds}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ^ ДОП.МТД. -----------------------------------------------------------------------
  // !! https://www.techiediaries.com/nestjs-upload-serve-static-file/
  // обнов.аватар Пользователя
  async setAvatar(
    userId: number,
    avatarId: number,
    avatarUrl: Express.Multer.File,
  ) {
    try {
      if (isDevelopment)
        this.logger.info(
          `db + AVA '${avatarUrl}' в Ava.ID '${avatarId}' > User.ID: '${userId}'`,
        );

      // const avaAdd = await this.userRepository.update(userId, {
      //   avatars: avatarUrl,
      // });
      // if (!avaAdd) {
      //   this.logger.error(
      //     `User.ID '${userId}' AVA '${avatarUrl}' не добавлена`,
      //   );
      //   throw new NotFoundException(
      //     `User.ID '${userId}' AVA '${avatarUrl}' не добавлена`,
      //   );
      // }
      // this.logger.info(`# User.ID '${userId}' AVA '${avatarUrl}'`);
      // return avaAdd;
      // Найдите или создайте FileEntity для данного аватара
      // const avatarFile = await this.fileRepository.findOne({
      //   where: { target: avatarUrl }, // Замените `url` на поле, в котором хранится URL файла
      // });

      // ^ замена ссылки
      // let avatarUrl = avatar.destination.replace(
      //   /^\.\/static\/users\//g,
      //   `users/${userId}/`,
      // );
      // avatarUrl = avatarUrl.replace(/\/$/, '');

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      // const user = await this.userRepository.findOne(userId);
      if (!user) {
        this.logger.warn(`Пользователь с ID '${userId}' не найден`);
        throw new NotFoundException(`Пользователь с ID '${userId}' не найден`);
      }

      const files = await this.fileRepository
        .createQueryBuilder('file')
        // .innerJoin('file.avatars', 'avatar') // Присоединяем таблицу пользователей
        .where('avatar.id = :avatarId', { avatarId }) // Фильтруем по avatarId
        .getMany();
      const avatarFile = await this.fileRepository.findOne({
        where: { id: avatarId },
      });
      // const users = await this.userRepository.findBy({ id: In([...userIdss]) });
      // const avatarFile = await this.fileRepository.findOne([avatarId]);
      // const avatarFile = await this.fileRepository.findBy([avatarId]);
      // Ищем файл по avatarId
      // const avatarFile = await this.fileRepository.findOne({
      //   // where: { id: avatarId, avatars: { id: userId } }, // Ищем файл с конкретным avatarId, связанным с пользователем
      //   relations: ['avatars'], // Загружаем связи с пользователями
      // });
      const existingAva = await this.fileRepository
        .createQueryBuilder('files')
        .where({ user: userId })
        .leftJoinAndSelect('files.avatars', 'avatarId')
        .withDeleted()
        .getOne();

      // const avatarFile = await this.fileRepository
      //   /* fghf */
      //   /* .findOne( */
      //   .findOne(
      //     /* fgh */
      //     {
      //       where: { avatars: avatarId },
      //       // avatars: In([...avatarId]),
      //     },
      //   );
      // Тип "number" не может быть назначен для типа "boolean | UserEntity | FindOperator<any> | FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[] | EqualOperator<...>".ts(2322)
      // (property) avatars?: boolean | UserEntity | FindOperator<any> | FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[] | EqualOperator<...>
      if (!avatarFile) {
        this.logger.warn(`Аватар с ID '${avatarId}' не найден`);
        throw new NotFoundException(`Аватар с ID '${avatarId}' не найден`);
      }
      // if (!avatarFile) {
      //   this.logger.error(`Файл для аватара с URL '${avatarUrl}' не найден`);
      //   throw new NotFoundException(
      //     `Файл для аватара с URL '${avatarUrl}' не найден`,
      //   );
      // }
      // // Обновите пользователя, добавив аватар в массив avatars
      // await this.userRepository
      //   .createQueryBuilder()
      //   .relation(UserEntity, 'avatars')
      //   .of(userId)
      //   .add(avatarFile);
      // Обновляем аватар в таблице файлов
      // const updatedFile = await this.fileRepository.save({
      //   ...avatarFile,
      //   filename: avatarUrl.filename,
      //   originalname: avatarUrl.originalname,
      //   mimetype: avatarUrl.mimetype,
      //   size: avatarUrl.size,
      //   target: avatarUrl.path, // предполагаю, что путь хранится здесь
      // });

      // // Обновляем ссылку на аватар у пользователя
      // user.avatars = updatedFile.target; // предполагаем, что 'avatars' - это строка
      // await this.usersRepository.save(user);

      // return {
      //   message: 'Аватар успешно заменен',
      //   userId: user.id,
      //   avatarId: updatedFile.id,
      //   avatarUrl: updatedFile.target,
      // };

      //  // Находим файл по avatarId
      //  const avatarFile = await this.fileRepository.findOne({ where: { id: avatarId } });

      //  if (!avatarFile) {
      //    throw new NotFoundException(`Файл аватара с ID '${avatarId}' не найден`);
      //  }

      //  // Если необходимо, здесь можно обновить данные аватара
      //  // например, переименовать или изменить его содержимое, если это требуется
      //  avatarFile.filename = avatar.originalname; // или любая другая логика обновления

      //  // Сохраняем файл и обновляем связь с пользователем
      //  await this.fileRepository.save(avatarFile);

      //  // Добавляем файл аватара к пользователю если его там нет
      //  if (!user.avatars.some(existingAvatar => existingAvatar.id === avatarId)) {
      //    user.avatars.push(avatarFile);
      //    await this.userRepository.save(user); // Сохраняем изменения в пользовательской сущности
      //  }

      this.logger.debug(
        `+ AVA '${avatarUrl}' в Ava.ID '${avatarId}' > User.ID: '${userId}'`,
      );
    } catch (error) {
      this.logger.error(
        `!Ошб. + AVA '${avatarUrl}' в Ava.ID '${avatarId}' > User.ID: '${userId}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // ^ МТД. > ADMIN -----------------------------------------------------------------------
  // добавить неск.Ролей к неск.Пользователям
  async addingRolesToUsers(
    addingRolesToUsersDto: AddingRolesToUsersDto,
  ): Promise<void> {
    try {
      if (isDevelopment)
        this.logger.info(
          `db ++ Пользователи и Роли в DTO '${addingRolesToUsersDto}'`,
        );

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
      if (!users) {
        this.logger.warn(`User.userIdss '${userIdss}' не нейдены`);
        throw new NotFoundException(`User.userIdss '${userIdss}' не нейдены`);
      }
      const roles = await this.roleRepository.findBy({ id: In([...roleIdss]) });
      if (!users) {
        this.logger.warn(`Role.roleIdss '${roleIdss}' не нейдены`);
        throw new NotFoundException(`Role.roleIdss '${roleIdss}' не нейдены`);
      }
      // Проверка существования пользователей и ролей
      if (
        users.length !== userIdss.length ||
        roles.length !== roleIdss.length
      ) {
        this.logger.error(
          'Одного или нескольких пользователей или ролей не существует.',
        );
        throw new NotFoundException(
          'Одного или нескольких пользователей или ролей не существует.',
        );
      }
      // Создание связей между Пользователями и Ролями
      for (const user of users) {
        for (const role of roles) {
          const userRoles = new UserRolesEntity();
          // userRoles.userId = user.id;
          // userRoles.roleId = role.id;
          await this.userRolesRepository.save(userRoles);
        }
      }
      this.logger.info(
        `++ Пользователи и Роли в DTO '${addingRolesToUsersDto}'`,
      );
    } catch (error) {
      this.logger.error(
        `!Ошб. + AVA User > Role DTO '${JSON.stringify(addingRolesToUsersDto)}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
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
  //   level, //
  // };

  // return userInfo;
  // }
}
