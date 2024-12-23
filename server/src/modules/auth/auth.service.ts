import { DataSource, Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// DTO
import { AuthDto } from './dto/auth.dto';
import { TokenDto } from './dto/token.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { UserDto } from '../users/dto/user.dto';
// окруж.табл.
import { AuthEntity } from './entities/auth.entity';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';
// утилиты Общие / БД
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';
// константы > команды запуска process.env.NODE_ENV
import { isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class AuthService {
  constructor(
    // логгер
    private readonly logger: LoggingWinston,
    // ч/з внедр.завис. + AuthEntity и др. > раб.ч/з this с табл.users и др.
    // ^ подкл.2 БД от NODE_ENV. PROD(SB) <> DEV(LH)
    @InjectRepository(AuthEntity, process.env.DB_NAM)
    private readonly authRepository: Repository<AuthEntity>,
    // для раб.с мтд.Сервисов
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly basicUtils: BasicUtils,
    private readonly dataBaseUtils: DatabaseUtils,
    // внедряем `Источник данных` в текущ.соед. > атомарности транзакций
    @InjectDataSource(process.env.DB_NAM)
    private readonly dataSource: DataSource,
  ) {}

  // регистр.нов.Пользователя
  async register(authDto: AuthDto): Promise<{ accessToken: string }> {
    // перем.объ. управ.транз./выполн.req ч/з мтд.созд.исполнит.req
    const queryRunner = this.dataSource.createQueryRunner();
    // соед.с БД перед транз./req
    await queryRunner.connect();
    // начало транзакции
    await queryRunner.startTransaction();

    try {
      if (isDevelopment)
        this.logger.info(`db register AuthDTO '${JSON.stringify(authDto)}'`);

      // проверка уникальности eml
      const existingUser = await this.usersService.findByEmail({
        email: authDto.email,
        flag: 'N',
      });
      if (existingUser) {
        this.logger.warn(`User.EML '${existingUser.email}' уже существует`);
        throw new UnauthorizedException(
          `User.EML '${existingUser.email}' уже существует`,
        );
      }

      // созд.нов.Польз.
      const user = await this.usersService.createUser(
        { ...authDto, fullName: '' },
        // выполн.req в текущ.транзакции
        queryRunner.manager,
      );
      this.logger.debug(`register + User.EML '${user.email}'`);

      // мин.id / созд.хеш.пароль / генер.ссылку активации
      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('auth');
      const hashedPassword = await bcrypt.hash(authDto.password, 10);
      const activationLink = this.generateActivationLink(user.id);

      // сохр.данн.auth (userId,hashPsw,refresh:null,activLink,activated:false
      await this.createAuth(
        smallestFreeId,
        user.id,
        hashedPassword,
        activationLink,
        queryRunner.manager,
      );

      // генер.Токенов
      const token = await this.tokenService.generateTokens(
        smallestFreeId,
        user,
        queryRunner.manager,
      );

      // фиксация успешной транзакции > сохр.данн.в БД
      await queryRunner.commitTransaction();

      return token;
    } catch (error) {
      // откат транзакции в случае ошибки
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `!Ошб. register authDto '${authDto}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    } finally {
      // откл.соед.с БД > др.req/app/serv
      await queryRunner.release();
    }
  }

  // вход Пользователя и выдача Токена
  async login(authDto: AuthDto): Promise<{ accessToken: string }> {
    try {
      if (isDevelopment)
        this.logger.info(`db login AuthDTO '${JSON.stringify(authDto)}'`);
      // проверка User по eml/hash.psw
      const user = await this.validateUser(authDto);
      // получ.Auth.ID
      const auth = await this.authRepository
        .createQueryBuilder('auth')
        // .leftJoinAndSelect('auth.userId', 'user') // загр.данн.User
        .select(['auth.id']) // загр.только ID
        .where('auth.userId = :userId', { userId: user.id }) // поиск по связи с User
        .getOne();
      // const auth = await this.authRepository.findOne({
      //   where: { userId: { id: user.id } }, // поиск по связи с User
      //   // relations: ['user'], // загр.связи (User)
      // });
      // генер./возврат нов.Токенов
      const token = this.tokenService.generateTokens(auth.id, user);
      return token;
    } catch (error) {
      this.logger.error(
        `!Ошб. login authDto '${authDto}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // созд./сохр.данн.auth
  async createAuth(
    id: number,
    userId: number,
    password: string,
    activationLink: string,
    manager?: any,
  ): Promise<void> {
    // универс.мтд. > транз.manager или Repository
    const repository = manager ? manager : this.authRepository;
    // созд.объ.auth с указ.сущн. > manager
    const auth = repository.create(AuthEntity, {
      id,
      userId,
      password,
      refreshToken: 'null',
      activationLink,
      activated: false,
    });
    // сохр.auth
    await repository.save(auth);
  }

  // валидация Пользователя
  async validateUser(authDto: AuthDto): Promise<UserDto /*  | null */> {
    try {
      if (isDevelopment)
        this.logger.info(`db valid.U AuthDTO '${JSON.stringify(authDto)}'`);
      // получ.Польз.по eml
      const user = await this.usersService.findUserByParam(authDto.email);
      // получ.psw по User.ID
      const auth = await this.authRepository
        .createQueryBuilder('auth')
        .select(['auth.password']) // загр.только psw
        .where('auth.userId = :userId', { userId: user.id })
        .getOne();
      // проверка user и сравнение паролей
      if (!user || !(await bcrypt.compare(authDto.password, auth.password))) {
        this.logger.warn(`Неверные учетные данные: '${authDto}'`);
        throw new UnauthorizedException(
          `Неверные учетные данные: '${authDto}'`,
        );
      }
      // возврат User
      return user;
    } catch (error) {
      this.logger.error(
        `!Ошб. < valid.U authDto '${authDto}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
    }
  }

  // генер.уник.актив-ной ссылки > подтвержд.почты
  private generateActivationLink(userId: number): string {
    // генер.уник.str ч/з fn v4
    let activationLink = uuidv4();
    let activationLinkPath = `${process.env.CLT_URL}/users/activate/${activationLink}`;
    return activationLinkPath;
  }
  async refreshTokens(userId: string, refreshToken: string): Promise<TokenDto> {
    if (isDevelopment) {
      this.logger.info(`refreshT User.ID '${userId}', ref_T '${refreshToken}'`);
    }

    const auth = null; /* await this.authRepository.findOne({
    where: { userId, refreshToken },
    }); */
    if (!auth) {
      this.logger.warn(`Неверный токен обновления '${refreshToken}'`);
      throw new UnauthorizedException(
        `Неверный токен обновления '${refreshToken}'`,
      );
    }
    const smallestFreeId =
      await this.dataBaseUtils.getSmallestIDAvailable('auth');

    const newTokens = await this.tokenService.generateTokens(
      smallestFreeId,
      auth.user,
    );
    // ^ сохр.токен
    return newTokens;
  }

  // удал.REF Токен из БД
  async logout(userId?: string, refreshToken?: string): Promise<void> {
    if (isDevelopment) {
      this.logger.info(`logout ref_T User.ID '${userId}'`);
    }
    await this.tokenService.removeToken(refreshToken);
  }
}
