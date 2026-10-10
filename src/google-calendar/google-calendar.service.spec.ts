import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarService } from './google-calendar.service';
import { UsersService } from 'src/users/users.service';
import { googleConfig } from 'src/config';

const mockOAuthClient = {
  generateAuthUrl: jest.fn<string, [Record<string, unknown>]>(),
  getToken: jest.fn<Promise<{ tokens: { refresh_token?: string | null } }>, [string]>(),
  revokeToken: jest.fn<Promise<void>, [string]>(),
  setCredentials: jest.fn<void, [{ refresh_token: string }]>(),
};
const mockInsert = jest.fn<Promise<{ data: { id?: string } }>, [Record<string, unknown>]>();
const mockDelete = jest.fn<Promise<void>, [Record<string, unknown>]>();

jest.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: jest.fn(() => mockOAuthClient) },
    calendar: jest.fn(() => ({ events: { insert: mockInsert, delete: mockDelete } })),
  },
}));

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;
  const users = {
    findById: jest.fn<
      Promise<{ googleRefreshToken?: string | null; googleCalendarConnected?: boolean } | null>,
      [number]
    >(),
    updateGoogleCalendarConnection: jest.fn<Promise<void>, [number, string | null, boolean]>(),
  };
  const config = {
    googleClientId: 'client-id',
    googleClientSecret: 'client-secret',
    googleRedirectUri: 'https://api.example.test/callback',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleCalendarService,
        { provide: googleConfig.KEY, useValue: config },
        { provide: UsersService, useValue: users },
      ],
    }).compile();

    service = module.get<GoogleCalendarService>(GoogleCalendarService);
  });

  it('genera URL OAuth offline con consentimiento y userId dentro de state', () => {
    mockOAuthClient.generateAuthUrl.mockReturnValue('https://accounts.example.test/auth');
    expect(service.getAuthUrl(17, '/settings')).toBe('https://accounts.example.test/auth');
    const options = mockOAuthClient.generateAuthUrl.mock.calls[0][0];
    expect(options).toMatchObject({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
    if (typeof options.state !== 'string') throw new Error('Se esperaba state serializado');
    expect(JSON.parse(options.state)).toEqual({ userId: 17, returnUrl: '/settings' });
  });

  it('guarda refresh token recibido por OAuth para el usuario indicado', async () => {
    mockOAuthClient.getToken.mockResolvedValue({ tokens: { refresh_token: 'google-refresh' } });
    await service.handleCallback('oauth-code', 17);
    expect(users.updateGoogleCalendarConnection.mock.calls).toContainEqual([17, 'google-refresh', true]);
  });

  it('marca conexión aun cuando Google no devuelve nuevo refresh token', async () => {
    mockOAuthClient.getToken.mockResolvedValue({ tokens: {} });
    await service.handleCallback('oauth-code', 17);
    expect(users.updateGoogleCalendarConnection.mock.calls).toContainEqual([17, null, true]);
  });

  it('desconecta sin revocar cuando no hay token y revoca antes de limpiar cuando existe', async () => {
    users.findById
      .mockResolvedValueOnce({ googleRefreshToken: null })
      .mockResolvedValueOnce({ googleRefreshToken: 'google-refresh' });
    mockOAuthClient.revokeToken.mockResolvedValue(undefined);

    await expect(service.disconnect(17)).resolves.toBe(true);
    await expect(service.disconnect(17)).resolves.toBe(true);
    expect(mockOAuthClient.revokeToken.mock.calls).toContainEqual(['google-refresh']);
    expect(users.updateGoogleCalendarConnection.mock.calls).toEqual([
      [17, null, false],
      [17, null, false],
    ]);
  });

  it('conserva la conexión si falla la revocación remota', async () => {
    users.findById.mockResolvedValue({ googleRefreshToken: 'google-refresh' });
    mockOAuthClient.revokeToken.mockRejectedValue(new Error('network down'));
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    await expect(service.disconnect(17)).resolves.toBe(false);
    expect(users.updateGoogleCalendarConnection.mock.calls).toHaveLength(0);
    log.mockRestore();
  });

  it('normaliza fallos de revocación que no son instancias Error', async () => {
    users.findById.mockResolvedValue({ googleRefreshToken: 'google-refresh' });
    mockOAuthClient.revokeToken.mockRejectedValue('remote failure');
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
    await expect(service.disconnect(17)).resolves.toBe(false);
    expect(log).toHaveBeenCalledWith('No se pudo revocar el token en Google: remote failure');
    log.mockRestore();
  });

  it('rechaza crear y borrar eventos si el usuario no tiene refresh token', async () => {
    users.findById.mockResolvedValue({ googleRefreshToken: null });
    const event = { title: 'Audiencia', start: new Date(), end: new Date() };
    await expect(service.createEvent(17, event)).rejects.toThrow('no tiene Google Calendar conectado');
    await expect(service.deleteEvent(17, 'event-id')).rejects.toThrow('no tiene Google Calendar conectado');
  });

  it('crea evento con fechas ISO y retorna su id', async () => {
    users.findById.mockResolvedValue({ googleRefreshToken: 'google-refresh' });
    mockInsert.mockResolvedValue({ data: { id: 'event-1' } });
    const start = new Date('2026-05-04T10:00:00.000Z');
    const end = new Date('2026-05-04T11:00:00.000Z');

    await expect(service.createEvent(17, { title: 'Audiencia', description: 'Detalle', start, end })).resolves.toBe(
      'event-1'
    );
    expect(mockOAuthClient.setCredentials.mock.calls).toContainEqual([{ refresh_token: 'google-refresh' }]);
    expect(mockInsert.mock.calls[0][0]).toMatchObject({
      calendarId: 'primary',
      requestBody: {
        summary: 'Audiencia',
        description: 'Detalle',
        location: undefined,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    });
  });

  it('devuelve null y registra cuando Google no asigna id de evento', async () => {
    users.findById.mockResolvedValue({ googleRefreshToken: 'google-refresh' });
    mockInsert.mockResolvedValue({ data: {} });
    const log = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    await expect(service.createEvent(17, { title: 'A', start: new Date(), end: new Date() })).resolves.toBeNull();
    expect(log).toHaveBeenCalled();
    log.mockRestore();

    mockDelete.mockRejectedValue('remote failure');
    const stringLog = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
    await service.deleteEvent(17, 'event-3');
    expect(stringLog).toHaveBeenCalledWith(expect.stringContaining('remote failure'));
    stringLog.mockRestore();
  });

  it('elimina evento y absorbe fallos de API registrándolos', async () => {
    users.findById.mockResolvedValue({ googleRefreshToken: 'google-refresh' });
    mockDelete.mockResolvedValue(undefined);
    await expect(service.deleteEvent(17, 'event-1')).resolves.toBeUndefined();
    expect(mockDelete.mock.calls[0][0]).toEqual({ calendarId: 'primary', eventId: 'event-1' });

    mockDelete.mockRejectedValue(new Error('remote failure'));
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
    await expect(service.deleteEvent(17, 'event-2')).resolves.toBeUndefined();
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('considera conectada la cuenta solo si hay flag y refresh token', async () => {
    users.findById.mockResolvedValueOnce({ googleCalendarConnected: true, googleRefreshToken: 'token' });
    users.findById.mockResolvedValueOnce({ googleCalendarConnected: false, googleRefreshToken: 'token' });
    users.findById.mockResolvedValueOnce(null);

    await expect(service.existsCalendarForUser(17)).resolves.toBe(true);
    await expect(service.existsCalendarForUser(17)).resolves.toBe(false);
    await expect(service.existsCalendarForUser(17)).resolves.toBe(false);
  });
});
