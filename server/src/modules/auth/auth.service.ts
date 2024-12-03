import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginAuthDto } from './dto/login-auth.dto';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserEntity> {
    // созд.нов. Пользователя
    return this.usersService.createUser(createUserDto);
  }

  async login(loginDto: LoginAuthDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // возвращ.Токен
    const payload = { sub: user.id, email: user.email };
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
