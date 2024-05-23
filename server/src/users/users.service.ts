// логика(бизнес,)
import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { AddingRolesToUsersDto } from '../roles/dto/add-roles-to-users.dto';
import { DatabaseUtils } from '../utils/database.utils';

@Injectable()
export class UsersService {
  // опред. > производства
  private isProduction = process.env.NODE_ENV === 'production';
  constructor(
    // ч/з внедр.завис. + UserEntity > раб.ч/з this с табл.users
    // ^ подкл.неск.БД.
    // ^ репозитории только > SupaBase
    @InjectRepository(UserEntity, 'supabase')
    private readonly userRepositorySB: Repository<UserEntity>,
    @InjectRepository(RoleEntity, 'supabase')
    private roleRepositorySB: Repository<RoleEntity>,
    @InjectRepository(UserRolesEntity, 'supabase')
    private userRolesRepositorySB: Repository<UserRolesEntity>,
    // ^ общ.репозит.настр.
    private roleService: RolesService,
    private dataBaseUtils: DatabaseUtils,
    // ^ доп.необязат.репозит(Optional) > разраб.localhost
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

  // СОЗД User + Role + связь
  async createUser(createUserDto: CreateUserDto) {
    // `получить наименьший доступный идентификатор` из табл.БД
    const smallestFreeId =
      await this.dataBaseUtils.getSmallestIDAvailable('user');
    // созд.объ.user
    const user = this.userRepository.create({
      ...createUserDto,
      id: smallestFreeId,
    });
    // получ.id Роли USER
    // const role = await this.roleService.findRoleByValue('USER');
    // запись Роли к User и сохр.связи в БД
    // user.roles = [role];
    // сохр.объ.user > БД
    await this.userRepository.save(user);

    // ^^ РАЗДЕЛ.ф.,настр. Внедрен.репозит.в зависим.от БД (е/и табл.на разн.БД)
    // await this.localUsersRepository.save(user);
    // if (process.env.NODE_ENV === 'production') {
    //   await this.elephantUsersRepository.save(user);
    // }

    // возвр.user
    return user;
  }

  // ^ получ.данн.из неск.БД.
  // тделить одинаковые данн.из неск.БД
  async findAllUsers(): Promise<(UserEntity & { source: string })[]> {
    // Добавляем информацию о источнике данных с помощью расширения типа
    interface ExtendedUserEntityUnderSource extends UserEntity {
      source: string;
    }

    // const isProduction = process.env.NODE_ENV === 'production';
    const result: (UserEntity & { source: string })[] = [];

    if (this.isProduction) {
      // В продакшене получаем данные только из Supabase
      const supabaseUsers = await this.userRepositorySB.find();
      return supabaseUsers.map((user) => ({ ...user, source: 'supabase' }));
      // return supabaseUsers;
    } else {
      // В режиме разработки получаем данные из обеих БД
      const localUsers: UserEntity[] = await this.userRepository.find();
      const supabaseUsers: UserEntity[] = await this.userRepositorySB.find();

      // Проходим по каждому пользователю из Supabase
      for (const supabaseUser of supabaseUsers) {
        // Ищем точно такой же объект в локальной БД
        const localUserIndex = localUsers.findIndex((localUser) => {
          return JSON.stringify(localUser) === JSON.stringify(supabaseUser);
        });

        // Если нашли такой же объект
        if (localUserIndex !== -1) {
          // Помещаем объект из Supabase с пометкой 'supabase' в результат
          result.push({
            ...supabaseUser,
            source: 'supabase',
          } as ExtendedUserEntityUnderSource);
          // Удаляем найденный объект из массива localUsers, чтобы не обрабатывать его повторно
          localUsers.splice(localUserIndex, 1);
        } else {
          // Если не нашли такой же объект, то помещаем объект из Supabase с пометкой 'supabase' в результат
          result.push({
            ...supabaseUser,
            source: 'supabase',
          } as ExtendedUserEntityUnderSource);
        }
      }
      // Добавляем оставшиеся объекты из localUsers с пометкой 'localhost'
      result.push(
        ...localUsers.map(
          (user) =>
            ({ ...user, source: 'localhost' }) as ExtendedUserEntityUnderSource,
        ),
      );
    }

    return result.sort((a, b) => a.id - b.id);
  }

  // ОДИН user.по id
  async findOneUser(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  // ОДИН user.по параметрам ID <> Email <> FullName
  // ! переделать под получ roles tracks user_roles в завис.от парам. и пр.
  async findUserByParam(param: string) {
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
    // объ.res, обраб.ошб., res по значени.
    const user = await this.userRepository.findOne({ where: whereCondition });
    if (!user) throw new NotFoundException('Такого Пользователя нет');
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Пользователь не найдена');
    user.fullname = updateUserDto.fullname;
    user.email = updateUserDto.email;
    return this.userRepository.save(user);
  }

  async removeUser(id: number) {
    return await this.userRepository.softDelete(id);
  }
  // async restoreUser(id: number) {
  //   return await this.userRepository.restore(id);
  // }

  // ^^ доп.мтд. ----------------------------------------------------------------------------------
  // !! https://www.techiediaries.com/nestjs-upload-serve-static-file/
  // обнов.аватар Пользователя
  public async setAvatar(userId: number, avatarUrl: string) {
    this.userRepository.update(userId, { avatar: avatarUrl });
  }

  // ^^ мтд.> ADMIN ----------------------------------------------------------------------------------
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
