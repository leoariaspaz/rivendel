import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { REFRESH_COOKIE_OPTIONS } from './auth.constants';
import { JwtGuard } from './jwt.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { LocalGuard } from './local.guard';
import { Public } from './public.decorator';
import { SkipJwt } from './skip-jwt.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
	@Public()
  async register(@Body() dto: { email: string; password: string }) {
    const user = this.authService.register(dto.email, dto.password);
		const { password, ...safeUser } = await user;
		return safeUser;
  }

  @Post('login')
	@SkipJwt()
  @UseGuards(LocalGuard)
  async login(
    @Req() req: { user: { id: number; email: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(req.user);

		res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
	@SkipJwt()
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.refreshTokens(
      req.user.userId,
      req.cookies.refresh_token,
    );

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

		return tokens;
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);
    res.clearCookie('refresh_token');
    return { ok: true };
  }
}
