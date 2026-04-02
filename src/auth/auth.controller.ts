import { Controller, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtGuard } from './jwt.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { LocalGuard } from './local.guard';
import { SkipJwt } from './skip-jwt.decorator';
import { authConfig, type AuthConfig } from '../config/auth.config';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
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
  async login(@Req() req: { user: { id: number; email: string } }, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(req.user);

    res.cookie('refresh_token', tokens.refreshToken, this.authConfig.refreshCookieOptions);

    const userName = await this.usersService
      .findById(req.user.id)
      .then((user) => user?.nombre || '[Usuario sin nombre]');

    return { accessToken: tokens.accessToken, userName };
  }

  @Post('refresh')
  @SkipJwt()
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.user.userId,
      req.cookies.refresh_token
    );

    res.cookie('refresh_token', refreshToken, this.authConfig.refreshCookieOptions);

    const userName = await this.usersService
      .findById(req.user.userId)
      .then((user) => user?.nombre || '[Usuario sin nombre]');

    return { accessToken, userName };
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);
    res.clearCookie('refresh_token');
    return { ok: true };
  }
}
