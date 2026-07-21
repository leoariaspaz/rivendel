import { Controller, Get, Post, Query, Res, Req, Inject } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { SkipJwt } from 'src/auth/skip-jwt.decorator';
import { Response } from 'express';
import { UserRequest } from '../auth/dto/user-request';
import { appConfig, type AppConfig } from 'src/config/app.config';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    @Inject(appConfig.KEY)
    private readonly config: AppConfig
  ) {}

  @Get('auth-url')
  getAuthUrl(@Req() req: UserRequest, @Query('returnUrl') returnUrl: string) {
    const url = this.googleCalendarService.getAuthUrl(req.user.userId, returnUrl);
    return { url };
  }

  @SkipJwt()
  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    const frontendUrl = this.config.frontendUrl + '/google-calendar/callback';

    try {
      const { userId, returnUrl } = JSON.parse(state) as { userId: number; returnUrl: string };
      await this.googleCalendarService.handleCallback(code, userId);
      res.redirect(`${frontendUrl}?google_calendar=connected&returnUrl=${returnUrl}`);
    } catch {
      res.redirect(`${frontendUrl}?google_calendar=error&returnUrl=/`);
    }
  }

  @Post('disconnect')
  async disconnect(@Req() req: UserRequest) {
    await this.googleCalendarService.disconnect(req.user.userId);
    return { success: true };
  }
}
