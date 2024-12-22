import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// DTO/Защита/Сервисы
import { AuthDto } from './dto/auth.dto';
import { TokenDto } from './dto/token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
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

  // Регистрация
  @Post('/register')
  @ApiOperation({ summary: 'Регистрация Пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован.',
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  async register(@Body() authDto: AuthDto) {
    this.logger.debug(`req register AuthDTO : '${JSON.stringify(authDto)}'`);
    return this.authService.register(authDto);
  }

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Аутентификация Пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь авторизован.' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные.' })
  async login(@Body() authDto: AuthDto) {
    this.logger.debug(`req login AuthDTO : '${JSON.stringify(authDto)}'`);
    return this.authService.login(authDto);
  }

  @Post('/refresh')
  async refreshTokens(@Req() request): Promise<TokenDto> {
    this.logger.debug(
      `req refresh - User.ID '${request.user.id}', refreshToken '${request.body.refreshToken}'`,
    );
    const userId = request.user.id; // получ.userId из токена
    const refreshToken = request.body.refreshToken; // получ.refreshToken из тела запроса
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Post('/logout')
  async logout(
    @Req() request,
    @Body('refreshToken') refreshToken: string,
  ): Promise<void | { message: string }> {
    this.logger.debug(`req logout User.ID '${request.user.id}'`);
    const userId = request.user.id;
    /* return */ await this.authService.logout(userId, refreshToken);
    return {
      message: 'Успешно вышел из системы',
    };
  }
}
