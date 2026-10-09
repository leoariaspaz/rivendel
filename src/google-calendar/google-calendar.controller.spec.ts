import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { appConfig } from 'src/config/app.config';
import { BadRequestException } from '@nestjs/common';

describe('GoogleCalendarController', () => {
  let controller: GoogleCalendarController;
  const service = { getAuthUrl: jest.fn(), handleCallback: jest.fn(), disconnect: jest.fn() };
  const config = { frontendUrl: 'https://frontend.example.test' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleCalendarController],
      providers: [
        { provide: GoogleCalendarService, useValue: service },
        { provide: appConfig.KEY, useValue: config },
      ],
    }).compile();

    controller = module.get<GoogleCalendarController>(GoogleCalendarController);
  });

  it('genera URL de autorización para el usuario de la sesión', () => {
    service.getAuthUrl.mockReturnValue('https://accounts.example.test');
    expect(controller.getAuthUrl({ user: { userId: 8 } } as any, '/profile')).toEqual({ url: 'https://accounts.example.test' });
    expect(service.getAuthUrl).toHaveBeenCalledWith(8, '/profile');
  });

  it('redirige callback exitoso al frontend con returnUrl', async () => {
    const response = { redirect: jest.fn() } as any;
    await controller.handleCallback('oauth-code', JSON.stringify({ userId: 8, returnUrl: '/settings' }), response);
    expect(service.handleCallback).toHaveBeenCalledWith('oauth-code', 8);
    expect(response.redirect).toHaveBeenCalledWith(
      'https://frontend.example.test/google-calendar/callback?google_calendar=connected&returnUrl=/settings'
    );
  });

  it('redirige callback inválido o fallido a pantalla de error', async () => {
    const response = { redirect: jest.fn() } as any;
    service.handleCallback.mockRejectedValue(new Error('OAuth failure'));
    await controller.handleCallback('oauth-code', JSON.stringify({ userId: 8, returnUrl: '/settings' }), response);
    expect(response.redirect).toHaveBeenCalledWith(
      'https://frontend.example.test/google-calendar/callback?google_calendar=error&returnUrl=/'
    );

    const invalidStateResponse = { redirect: jest.fn() } as any;
    await controller.handleCallback('oauth-code', '{broken', invalidStateResponse);
    expect(invalidStateResponse.redirect).toHaveBeenCalledWith(
      'https://frontend.example.test/google-calendar/callback?google_calendar=error&returnUrl=/'
    );
  });

  it('lanza HTTP 400 si Google no permite desconectar y delega éxito', async () => {
    service.disconnect.mockResolvedValue(false);
    await expect(controller.disconnect({ user: { userId: 8 } } as any)).rejects.toBeInstanceOf(BadRequestException);
    service.disconnect.mockResolvedValue(true);
    await expect(controller.disconnect({ user: { userId: 8 } } as any)).resolves.toBeUndefined();
    expect(service.disconnect).toHaveBeenCalledWith(8);
  });
});
