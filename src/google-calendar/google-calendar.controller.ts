import { Controller, Get, Post, Query, Res, Req, Inject } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { SkipJwt } from 'src/auth/skip-jwt.decorator';
import { Response } from 'express';
import { RequestWithUser } from './dto/request-with-user.dto';
import { appConfig, type AppConfig } from 'src/config/app.config';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    @Inject(appConfig.KEY)
    private readonly config: AppConfig
  ) {}

  // El frontend llama esto para obtener la URL de autorización
  @Get('auth-url')
  getAuthUrl(@Req() req: RequestWithUser) {
    const url = this.googleCalendarService.getAuthUrl(req.user.id);
    return { url };
  }

  // Google redirige acá después del consentimiento
  // OJO: esta ruta NO lleva JwtAuthGuard porque viene de Google
  @SkipJwt()
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string, // userId que mandamos en el paso de auth
    @Res() res: Response
  ) {
    const frontendUrl = this.config.frontendUrl;

    try {
      const userId = parseInt(state, 10);
      await this.googleCalendarService.handleCallback(code, userId);
      res.redirect(`${frontendUrl}?google_calendar=connected`);
    } catch {
      res.redirect(`${frontendUrl}?google_calendar=error`);
    }
  }

  @Post('disconnect')
  async disconnect(@Req() req: RequestWithUser) {
    await this.googleCalendarService.disconnect(req.user.id);
    return { success: true };
  }
}
