import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('/auth')
@ApiTags('Аутентификация')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Регистрация Пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован.',
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно авторизован.',
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные.' })
  async login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }
}
