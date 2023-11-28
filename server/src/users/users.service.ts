// логика(бизнес,)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { /* In, */ Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';
import { UserRolesEntity } from 'src/roles/entities/user-roles.entity';
// import { AddingRolesToUsersDto } from 'src/roles/dto/add-roles-to-users.dto';

@Injectable()
export class UsersService {
  // ч/з внедр.завис. + UserEntity > раб.ч/з this с табл.users
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private roleService: RolesService,
    @InjectRepository(UserRolesEntity)
    private userRolesRepository: Repository<UserRolesEntity>,
  ) {}

  // `получить наименьший доступный идентификатор`
  async getSmallestAvailableId(tableName: string): Promise<number> {
    let customRepository: any;
    // опред.репозитор.
    if (tableName === 'user') customRepository = this.userRepository;
    // else if (tableName === 'track') customRepository = this.trackRepository;
    // else if (tableName === 'comment') customRepository = this.commentRepository;
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

  // СОЗД User + Role + связь
  async create(createUserDto: CreateUserDto) {
    // fn по возвр.наименьшего свободного id
    const smallestFreeId = await this.getSmallestAvailableId('user');
    // сохр.user
    const user = this.userRepository.create({
      ...createUserDto,
      id: smallestFreeId,
    });
    // получ.id Роли USER
    const role = await this.roleService.getRoleByValue('USER');
    // запись Роли к User и сохр.связи в БД
    user.roles = [role];
    await this.userRepository.save(user);

    return user;
  }

  async findAllUsers(/* usersIds?: string */): Promise<UserEntity[]> {
    // fn для неск.id
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

    // мтд.напрямую
    const users = await this.userRepository.find({
      relations: ['roles' /* 'tracks' */ /* 'user_roles' */],
    });

    // мтд.ч/з `созд. строитель запросов`
    // const users = await this.userRepository
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.roles', 'role')
    //   // ! дораб.
    //   .leftJoinAndSelect('role.user_roles', 'level')
    //   .getMany();

    return users;
  }

  // ОДИН user
  async findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }
  // ! не отраж.в swgg
  // получ.user по email
  async findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }
  // ! не отраж.в swgg
  // получ.user по id
  async findById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, updateUserDto: UpdateUserDto) {
    return `Это действие обновляет пользователя с #${id}`;
  }

  async remove(id: number) {
    return `Это действие удаляет пользователя с #${id}`;
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
  //  ----------------------------------------------------------------------------------

  // ^^ ADMIN ----------------------------------------------------------------------------------
}
