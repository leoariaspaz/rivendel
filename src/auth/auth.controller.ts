import { Controller, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtGuard } from './jwt.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { LocalGuard } from './local.guard';
import { SkipJwt } from './skip-jwt.decorator';
import { authConfig, type AuthConfig } from '../config/auth.config';
import { UsersService } from 'src/users/users.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger/dist';
import { LoginDto } from './dto/login.dto';
import { UserDTO } from './dto/user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

@Controller('auth')
@ApiTags('Autenticación')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(authConfig.KEY)
    private readonly authConfig: AuthConfig
  ) {}

  @Post('login')
  @SkipJwt()
  @UseGuards(LocalGuard)
  @ApiOperation({ summary: 'Inicia sesión y obtiene tokens de acceso y refresco' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Se devuelve el accessToken y se setea una cookie httpOnly con el refresh_token.',
    type: LoginResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'Contiene el refresh_token.',
        schema: { type: 'string', example: 'refresh_token=abc123...; HttpOnly; Secure' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Req() req: { user: UserDTO }, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(req.user);

    res.cookie('refresh_token', tokens.refreshToken, this.authConfig.refreshCookieOptions);

    const userName = await this.usersService
      .findById(req.user.id)
      .then((user) => user?.nombre || '[Usuario sin nombre]');

    return new LoginResponseDto(tokens.accessToken, userName);
  }

  @Post('refresh')
  @SkipJwt()
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description: 'Extrae el refresh_token de las cookies para generar un nuevo par de tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente. Se emite una nueva cookie refresh_token.',
    type: RefreshResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'Actualiza la cookie con el nuevo refresh_token.',
        schema: { type: 'string', example: 'refresh_token=xyz789...; HttpOnly; Secure' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  @ApiBearerAuth('access-token')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.user.userId,
      req.cookies.refresh_token
    );

    res.cookie('refresh_token', refreshToken, this.authConfig.refreshCookieOptions);

    const userName = await this.usersService
      .findById(req.user.userId)
      .then((user) => user?.nombre || '[Usuario sin nombre]');

    return new RefreshResponseDto(accessToken, userName);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida la sesión del usuario en el servidor y limpia la cookie del refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente.',
    type: LogoutResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'Limpia la cookie refresh_token (setea fecha de expiración pasada).',
        schema: { type: 'string', example: 'refresh_token=; Max-Age=0; path=/; httponly' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado / Token inválido' })
  @ApiBearerAuth('access-token')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);
    res.clearCookie('refresh_token');
    return new LogoutResponseDto(true);
  }
}
