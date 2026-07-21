import { Inject, Injectable, Logger } from '@nestjs/common';
import { googleConfig, type GoogleConfig } from 'src/config';
import { google, Auth } from 'googleapis';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    @Inject(googleConfig.KEY)
    private readonly config: GoogleConfig,
    private readonly usersService: UsersService
  ) {}

  private createOAuthClient(): Auth.OAuth2Client {
    return new google.auth.OAuth2(
      this.config.googleClientId,
      this.config.googleClientSecret,
      this.config.googleRedirectUri
    );
  }

  getAuthUrl(userId: number, returnUrl: string): string {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: JSON.stringify({ userId, returnUrl }),
    });
  }

  async handleCallback(code: string, userId: number): Promise<void> {
    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);
    await this.usersService.updateGoogleCalendarConnection(userId, tokens.refresh_token || null, true);
  }

  async disconnect(userId: number): Promise<boolean> {
    const user = await this.usersService.findById(userId);

    if (user?.googleRefreshToken) {
      try {
        const client = this.createOAuthClient();
        await client.revokeToken(user.googleRefreshToken);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error('No se pudo revocar el token en Google: ' + message);
        return false;
      }
    }
    await this.usersService.updateGoogleCalendarConnection(userId, null, false);
    return true;
  }

  async createEvent(
    userId: number,
    event: {
      title: string;
      description?: string;
      start: Date;
      end: Date;
      location?: string;
    }
  ): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user?.googleRefreshToken) {
      throw new Error('El usuario no tiene Google Calendar conectado');
    }

    const client = this.createOAuthClient();
    client.setCredentials({ refresh_token: user.googleRefreshToken });

    const calendar = google.calendar({ version: 'v3', auth: client });

    const response = await calendar.events.insert({
      calendarId: 'primary', // calendario principal del usuario
      requestBody: {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
      },
    });

    if (!response.data.htmlLink) {
      throw new Error('No se pudo generar el enlace del evento de Google Calendar');
    }
    return response.data.htmlLink; // URL del evento en Google Calendar
  }
}
