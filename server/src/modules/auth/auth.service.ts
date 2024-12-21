import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { AuthDto } from './dto/auth.dto';
import { TokenDto } from './dto/token.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { AuthEntity } from './entities/auth.entity';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { BasicUtils } from '../../common/utils/basic.utils';
import { DatabaseUtils } from '../../common/utils/database.utils';
import { LoggingWinston } from '../../config/logging/log_winston.config';
import { isDevelopment } from '../../config/envs/env.consts';

@Injectable()
export class AuthService {
  constructor(
    // ч/з внедр.завис. + UserEntity и др. > раб.ч/з this с табл.users и др.
    private readonly jwtService: JwtService,
    // логгер
    private readonly logger: LoggingWinston,
    // для раб.с мтд.Сервисов
    private readonly usersService: UsersService,
    // ч/з внедр.завис. + UserEntity и др. > раб.ч/з this с табл.users и др.
    // ^ подкл.2 БД от NODE_ENV. PROD(SB) <> DEV(LH)
    @InjectRepository(AuthEntity, process.env.DB_NAM)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly basicUtils: BasicUtils,
    private readonly dataBaseUtils: DatabaseUtils,
    // внедряем `Источник данных` в текущ.соед. > атомарности транзакций
    @InjectDataSource(process.env.DB_NAM)
    private readonly dataSource: DataSource,
  ) {}

  // Регистр.нов. Пользователя
  async register(authDto: AuthDto): Promise<TokenDto> {
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
      const existingUser = await this.usersService.findByEmail(authDto.email);
      if (existingUser) {
        this.logger.warn(`User.EML '${existingUser.email}' уже существует`);
        throw new UnauthorizedException(
          `User.EML '${existingUser.email}' уже существует`,
        );
      }
      // созд.нов.Польз.
      const user = await this.usersService.createUser(
        {
          ...authDto,
          fullName: '',
        },
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
      await this.createAuthRecord(
        smallestFreeId,
        user.id,
        hashedPassword,
        activationLink,
        queryRunner.manager,
      );

      const token = await this.generateTokens(
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

  // Вход Пользователя и выдача Токена
  async login(authDto: AuthDto): Promise<TokenDto> {
    try {
      if (isDevelopment)
        this.logger.info(`db login AuthDTO '${JSON.stringify(authDto)}'`);

      const smallestFreeId =
        await this.dataBaseUtils.getSmallestIDAvailable('auth');
      const user = await this.validateUser(authDto);

      return this.generateTokens(smallestFreeId, user);
    } catch (error) {
      this.logger.error(
        `!Ошб. login authDto '${authDto}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // валидация Пользователя
  async validateUser(authDto: AuthDto): Promise<UserDto /*  | null */> {
    try {
      if (isDevelopment)
        this.logger.info(`db valid.U AuthDTO '${JSON.stringify(authDto)}'`);

      // получ.Польз.по eml
      const user = await this.usersService.findUserByParam(
        authDto.email,
        'NoExisting',
      );
      // получ.psw по User.ID
      const userPsw = await this.authRepository.findOne({
        where: { id: user.id },
      });

      // проверка user и сравнение паролей
      if (
        !user ||
        !(await bcrypt.compare(authDto.password, userPsw.password))
      ) {
        this.logger.warn(`Неверные учетные данные: '${authDto}'`);
        throw new UnauthorizedException(
          `Неверные учетные данные: '${authDto}'`,
        );
      }

      return user;
    } catch (error) {
      this.logger.error(
        `!Ошб. < valid.U authDto '${authDto}': '${await this.basicUtils.hendlerTypesErrors(error)}'`,
      );
      throw error;
    }
  }

  // генерация JWT Токена
  private async generateTokens(
    id: number,
    user: JwtPayloadDto,
    manager?: any,
  ): Promise<TokenDto /* { accessToken: string } */> {
    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.EXPIRES_ACST_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.EXPIRES_REFT_IN,
    });

    await this.saveRefreshToken(id, +user.id, refreshToken, manager);
    this.logger.debug(
      `generate - acs_T '${accessToken}', ref_T '${refreshToken}'`,
    );
    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokenDto> {
    if (isDevelopment) {
      this.logger.info(`refreshT User.ID '${userId}', ref_T '${refreshToken}'`);
    }

    const auth = null;
    if (!auth) {
      this.logger.warn(`Неверный токен обновления '${refreshToken}'`);
      throw new UnauthorizedException(
        `Неверный токен обновления '${refreshToken}'`,
      );
    }
    const smallestFreeId =
      await this.dataBaseUtils.getSmallestIDAvailable('auth');

    const newTokens = await this.generateTokens(smallestFreeId, auth.user);
    return newTokens;
  }

  async logout(userId: string): Promise<void> {
    if (isDevelopment) {
      this.logger.info(`logout ref_T User.ID '${userId}'`);
    }
    // Удаляем refresh token из базы данных
    // await this.authRepository.delete({ userId });
  }

  private generateActivationLink(userId: number): string {
    // генер.уник.ссылку активации ч/з fn v4(подтверждение акаунта)
    let activationLink = uuidv4();
    let activationLinkPath = `${process.env.CLT_URL}/users/activate/${activationLink}`;

    return activationLinkPath;
  }

  // проверка доступа с Токеном
  async validateToken(token: string) {
    const decoded = this.jwtService.verify(token);
    return await this.usersService.findOneUser(decoded.id);
  }

  // созд.данн.auth
  async createAuthRecord(
    id: number,
    userId: number,
    password: string,
    activationLink: string,
    manager?: any,
  ): Promise<void> {
    // универс.мтд. > транз.manager или Repository
    const repository = manager ? manager : this.authRepository;

    // указ.сущн. > manager
    const authRecord = repository.create(AuthEntity, {
      id,
      userId,
      password,
      refreshToken: null,
      activationLink,
      activated: false,
    });
    console.log('authRecord : ', authRecord);
    await repository.save(authRecord);
  }

  async saveRefreshToken(
    id: number,
    userId: number,
    refreshToken: string,
    manager?: any,
  ): Promise<void> {
    const authRecord = manager.create(AuthEntity, { id, userId, refreshToken });
    await manager.save(authRecord);
  }

  async validateRefreshToken(refreshToken: string): Promise<UserDto | null> {
    const authRecord = await this.authRepository.findOne({
      where: { refreshToken },
    });
    return authRecord
      ? await this.usersService.findOneUser(authRecord.userId)
      : null;
  }
}
