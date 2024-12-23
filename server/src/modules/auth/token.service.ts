import { Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { TokenDto } from './dto/token.dto';
import { UserDto } from '../users/dto/user.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { AuthEntity } from '../auth/entities/auth.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(AuthEntity, process.env.DB_NAM)
    private readonly authRepository: Repository<AuthEntity>,
    @InjectRepository(UserEntity, process.env.DB_NAM)
    private readonly userRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggingWinston,
  ) {}

  // проверка ACS Токен и возврат.user
  async validateAccessToken(token: string): Promise<UserDto | null> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.ACS_T_SECRET,
      });
      return decoded ? await this.usersService.findOneUser(decoded.id) : null;
    } catch (error) {
      throw new InternalServerErrorException('Неверный Токен Доступа');
    }
  }

  // проверка REF Токен и возврат.user
  async validateRefreshToken(token: string): Promise<UserDto | null> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.REF_T_SECRET,
      });
      return decoded ? await this.usersService.findOneUser(decoded.id) : null;
    } catch (error) {
      throw new InternalServerErrorException('Неверный Токен Обновления');
    }
  }

  // генерация Токенов
  async generateTokens(
    idAuth: number,
    user: JwtPayloadDto,
    manager?: any,
  ): Promise<TokenDto /* { accessToken: string } */> {
    // генер.2 Токена из user ID/EML
    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACS_T_SECRET,
      expiresIn: process.env.ACS_T_EXPIRES,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REF_T_SECRET,
      expiresIn: process.env.REF_T_EXPIRES,
    });
    // сохр./лог. Refresh Токен
    await this.saveToken(idAuth, +user.id, refreshToken, manager);
    this.logger.debug(
      `generate - acs_T '${accessToken}', ref_T '${refreshToken}'`,
    );
    // возврат 2х Токенов
    return { accessToken, refreshToken };
  }

  // сохр.Токенов
  async saveToken(
    id: number,
    userId: number,
    refreshToken: string,
    manager?: any,
  ): Promise<void> {
    const repository = manager ? manager : this.authRepository;
    // перезапись сущ. / созд.,сохр.нов.Токен
    const tokenData = await this.authRepository
      .createQueryBuilder('auth')
      .where('auth.userId = :userId', { userId })
      .getOne();
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      /* return */ await repository.save(tokenData);
    } else {
      // созд./сохр.нов.Токен
      const token = repository.create(AuthEntity, { id, userId, refreshToken });
      /* return */ await repository.save(token);
    }
  }

  // удал.Токенов
  async removeToken(refreshToken: string): Promise<number> {
    const deleteResult = await this.authRepository.delete({ refreshToken });
    return deleteResult.affected ?? 0;
  }
}
