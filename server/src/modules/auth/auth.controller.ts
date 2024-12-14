import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// Сервисы/DTO
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
// декор.получ. User.ID
import { UserId } from '../../common/decorators/user-id.decorator';
// логгирование LH
import { LoggingWinston } from '../../config/logging/log_winston.config';

@Controller('/auth')
@ApiTags('Аутентификация')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // логгер
    private readonly logger: LoggingWinston,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Регистрация Пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован.',
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.debug(`req Auth register`);
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
    this.logger.debug(`req Auth login`);
    return this.authService.login(loginDto);
  }
}
