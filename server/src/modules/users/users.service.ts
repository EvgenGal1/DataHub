// логика(бизнес,)
import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Logger } from 'winston';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { UserRolesEntity } from '../roles/entities/user-roles.entity';
import { AddingRolesToUsersDto } from '../roles/dto/add-roles-to-users.dto';
// утилиты БД
import { DatabaseUtils } from '../../common/utils/database.utils';
// константы > команды запуска process.env.NODE_ENV
import {
  isProduction,
  isDevelopment,
  isTotal,
} from '../../common/envs/env.consts';

// врем.общ.fn отраб.ошб.throw
function createThrowError(message?: string): () => never {
  throw new NotFoundException(`${message}`);
}

@Injectable()
export class UsersService {
  constructor(
    // логи
    @Inject('WINSTON_LOGGER') private readonly logger: Logger,
    // ч/з внедр.завис. + UserEntity и др. > раб.ч/з this с табл.users и др.
    // ^ подкл.неск.БД.
    // ^ репозитории только > БД SupaBase(SB)
    @Optional()
    @InjectRepository(UserEntity, 'supabase')
    private readonly userRepositorySB: Repository<UserEntity>,
    @Optional()
    @InjectRepository(RoleEntity, 'supabase')
    private roleRepositorySB: Repository<RoleEntity>,
    @Optional()
    @InjectRepository(UserRolesEntity, 'supabase')
    private userRolesRepositorySB: Repository<UserRolesEntity>,
    // ^ общ.репозит.настр.
    private roleService: RolesService,
    private dataBaseUtils: DatabaseUtils,
    // ^ доп.необязат.репозит(Optional) > БД LocalHost(LH)
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
    // логи,перем.ошб.
    this.logger.info(
      `Запись Users в БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `Users не сохранён в БД`;
    // `получить наименьший доступный идентификатор` из табл.БД
    const smallestFreeId =
      await this.dataBaseUtils.getSmallestIDAvailable('user');
    // созд.репоз./объ.user взависимости от process.env.NODE_ENV
    const definiteUserRepository = isProduction
      ? this.userRepositorySB
      : this.userRepository;
    const user = definiteUserRepository.create({
      ...createUserDto,
      id: smallestFreeId,
    });

    // ^ будущ.запись Роли,Уровня Роли,psw,token и др.

    // условие > PROD и DEV. перем.,req.,лог.,ошб.
    if (isProduction || isDevelopment) {
      const savedUser: UserEntity = await definiteUserRepository.save(user);
      if (!savedUser) {
        this.logger.error(`Лог. ${err} ${isProduction ? 'SB' : 'LH'}`);
        createThrowError(`Ошб. ${err} ${isProduction ? 'SB' : 'LH'}`);
      }
      return savedUser;
    }
    // условие > TOTAL. PROD + DEV. запись данн.в SB и LH
    if (isTotal) {
      // получ.данн.обеих БД
      const savedUserSB = await this.userRepositorySB.save(user);
      const savedUserLH = await this.userRepository.save(user);
      if (!savedUserSB && !savedUserLH) {
        this.logger.error(`Лог. ${err} SB и LH`);
        createThrowError(`Ошб. ${err} SB и LH`);
      }
      const userSavedSB = { ...savedUserSB, source: 'DB_SB' };
      const userSavedLH = { ...savedUserLH, source: 'DB_LH' };
      return {
        ...userSavedSB,
        [`userLH_${userSavedLH.id}`]: userSavedLH,
      };
    }
  }

  // все users из одной/неск.БД
  async findAllUsers(): Promise<
    (UserEntity | (UserEntity & { source: string }))[]
  > {
    // логи,перем.ошб.
    this.logger.info(
      `Получение всех users из БД ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `users нет в БД`;
    // условие > PROD или DEV. перем.,req.,лог.,ошб.
    if (isProduction || isDevelopment) {
      const definiteUserRepository: Repository<UserEntity> = isProduction
        ? this.userRepositorySB
        : this.userRepository;
      const users = await definiteUserRepository.find();
      if (!users) {
        this.logger.error(`Лог. ${err} ${isProduction ? 'SB' : 'LH'}`);
        createThrowError(`Ошб. ${err} ${isProduction ? 'SB' : 'LH'}`);
      }
      return users;
    }
    // условие > TOTAL. PROD + DEV. объедин.данн.SB с влож.данн.LH
    if (isTotal) {
      // расшир.типа,перем.возращ. > неск.БД
      interface ExtendedUserEntityUnderSource extends UserEntity {
        source: string;
      }
      const resultUnion: (UserEntity & { source: string })[] = [];
      // получ.данн.обеих БД
      const usersSB: UserEntity[] = await this.userRepositorySB.find();
      const usersLH: UserEntity[] = await this.userRepository.find();
      if (usersSB && !usersLH) {
        this.logger.error(`Лог. ${err} SB и LH`);
        createThrowError(`Ошб. ${err} SB и LH`);
      }
      // перебор всех user из БД SB
      for (const supabaseUser of usersSB) {
        // получ.idx user БД LH е/и объ.одинаковы
        const localUserIndex = usersLH.findIndex((localUser) => {
          return JSON.stringify(localUser) === JSON.stringify(supabaseUser);
        });
        // е/и idx нет - удал.user из масс.LH
        if (localUserIndex !== -1) usersLH.splice(localUserIndex, 1);
        // добав.users SB в масс.resultUnion с указ.источ.БД
        resultUnion.push({
          ...supabaseUser,
          source: 'DB_SB',
        } as ExtendedUserEntityUnderSource);
      }
      // добав.оставшиеся users LH в масс.resultUnion с указ.источ.БД
      resultUnion.push(
        ...usersLH.map(
          (user) =>
            ({ ...user, source: 'DB_LH' }) as ExtendedUserEntityUnderSource,
        ),
      );
      return resultUnion.sort((a, b) => a.id - b.id);
    }
  }

  // ОДИН user.по id
  async findOneUser(id: number): Promise<UserEntity> {
    // логи,перем.ошб.
    this.logger.info(
      `Получение user по ID ${id} из ${isProduction ? 'SB' : isDevelopment ? 'LH' : 'SB и LH'}`,
    );
    const err = `user с ID ${id} нет в БД`;
    // условие > PROD и DEV. перем.,req.,лог.,ошб.
    if (isProduction || isDevelopment) {
      const definiteUserRepository: Repository<UserEntity> = isProduction
        ? this.userRepositorySB
        : this.userRepository;
      const user = await definiteUserRepository.findOneBy({ id });
      if (!user) {
        this.logger.error(`Лог. ${err} ${isProduction ? 'SB' : 'LH'}`);
        createThrowError(`Ошб. ${err} ${isProduction ? 'SB' : 'LH'}`);
      }
      return user;
    }
    // ОБЩ.с БД - SB и LH
    if (isTotal) {
      const userSB = await this.userRepositorySB.findOneBy({ id });
      const userLH = await this.userRepository.findOneBy({ id });
      // логг./ошб. е/и нет 2х
      if (!userSB && !userLH) {
        this.logger.error(`Лог. ${err} SB и LH`);
        createThrowError(`Ошб. ${err} SB и LH`);
      }
      // возврат е/и есть 1
      if (!userSB || !userLH) return userSB ?? userLH;
      // провер.равн.данн.userSB <> userLH
      const areEqual = JSON.stringify(userSB) === JSON.stringify(userLH);
      // е/и не равны - указ.источ.DB, возвращ.раскрыт.userSB и влож.userLH
      if (!areEqual) {
        const userWithSourceSB = { ...userSB, source: 'DB_SB' };
        const userWithSourceLH = { ...userLH, source: 'DB_LH' };
        return {
          ...userWithSourceSB,
          [`userLH_${userLH.id}`]: userWithSourceLH,
        };
      }
      // е/и равны возврат userSB
      return userSB;
    }
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
