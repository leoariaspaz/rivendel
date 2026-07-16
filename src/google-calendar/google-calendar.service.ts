import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { googleConfig, type GoogleConfig } from 'src/config';
import { google, Auth } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  constructor(
    @Inject(googleConfig.KEY)
    private readonly config: GoogleConfig,
    private readonly prisma: PrismaService
  ) {}

  // Crea el cliente OAuth2 base (sin credenciales de usuario)
  private createOAuthClient(): Auth.OAuth2Client {
    return new google.auth.OAuth2(
      this.config.googleClientId,
      this.config.googleClientSecret,
      this.config.googleRedirectUri
    );
  }

  getAuthUrl(userId: number): string {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: String(userId), // <-- se devuelve intacto en el callback
    });
  }

  // Intercambia el code por tokens y los guarda
  async handleCallback(code: string, userId: number): Promise<void> {
    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken: tokens.refresh_token,
        googleCalendarConnected: true,
      },
    });
  }

  // Desconectar Google Calendar
  async disconnect(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken: null,
        googleCalendarConnected: false,
      },
    });
  }

  // Crea un evento en el calendario del usuario
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

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
