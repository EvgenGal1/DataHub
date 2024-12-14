import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginAuthDto } from './dto/login-auth.dto';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Injectable()
export class AuthService {
  constructor(
    // ч/з внедр.завис. + UserEntity и др. > раб.ч/з this с табл.users и др.
    private readonly jwtService: JwtService,
    // логгер
    private readonly logger: LoggingWinston,
    private readonly usersService: UsersService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserEntity> {
    this.logger.debug(`req Auth register`);
    // созд.нов. Пользователя
    return this.usersService.createUser(createUserDto);
  }

  async login(loginDto: LoginAuthDto): Promise<{ accessToken: string }> {
    this.logger.debug(`req Auth login`);
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      this.logger.warn(`User '${user}' не создан`);
      throw new UnauthorizedException('Неверные полномочия');
    }

    // возвращ.Токен
    const payload = { sub: user.id, email: user.email };
    this.logger.debug(`# User \`ID-eml\` '${payload}'`);
    return { accessToken: this.jwtService.sign(payload) };
  }

  // проверка доступа с Токеном
  async validateToken(token: string) {
    const decoded = this.jwtService.verify(token);
    return this.usersService.findOneUser(decoded.sub); // Возвращаем пользователя, если токен действителен
  }

  async validateUser(email: string, password: string) {
    return this.usersService.validateUser(email, password);
  }

  // async getCurrentUser(userId: number) {
  //   return await this.usersService.findOneUser(userId);
  // }

  // async userHasRole(userId: number, role: string) {
  //   const user = await this.usersService.findOneUser(userId);
  //   return user && user.roles.includes(role); // Проверяем, есть ли у пользователя эта роль
  // }
}
