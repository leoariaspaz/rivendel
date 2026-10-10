import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { appConfig } from 'src/config/app.config';
import { BadRequestException } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { UserRequest } from 'src/auth/dto/user-request';

describe('GoogleCalendarController', () => {
  let controller: GoogleCalendarController;
  const service = mockDeep<GoogleCalendarService>();
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
    const request = mockDeep<UserRequest>();
    request.user = { userId: 8 };
    expect(controller.getAuthUrl(request, '/profile')).toEqual({
      url: 'https://accounts.example.test',
    });
    expect(service.getAuthUrl.mock.calls).toContainEqual([8, '/profile']);
  });

  it('redirige callback exitoso al frontend con returnUrl', async () => {
    const response = mockDeep<Response>();
    await controller.handleCallback('oauth-code', JSON.stringify({ userId: 8, returnUrl: '/settings' }), response);
    expect(service.handleCallback.mock.calls).toContainEqual(['oauth-code', 8]);
    expect(response.redirect.mock.calls).toContainEqual([
      'https://frontend.example.test/google-calendar/callback?google_calendar=connected&returnUrl=/settings',
    ]);
  });

  it('redirige callback inválido o fallido a pantalla de error', async () => {
    const response = mockDeep<Response>();
    service.handleCallback.mockRejectedValue(new Error('OAuth failure'));
    await controller.handleCallback('oauth-code', JSON.stringify({ userId: 8, returnUrl: '/settings' }), response);
    expect(response.redirect.mock.calls).toContainEqual([
      'https://frontend.example.test/google-calendar/callback?google_calendar=error&returnUrl=/',
    ]);

    const invalidStateResponse = mockDeep<Response>();
    await controller.handleCallback('oauth-code', '{broken', invalidStateResponse);
    expect(invalidStateResponse.redirect.mock.calls).toContainEqual([
      'https://frontend.example.test/google-calendar/callback?google_calendar=error&returnUrl=/',
    ]);
  });

  it('lanza HTTP 400 si Google no permite desconectar y delega éxito', async () => {
    service.disconnect.mockResolvedValue(false);
    const request = mockDeep<UserRequest>();
    request.user = { userId: 8 };
    await expect(controller.disconnect(request)).rejects.toBeInstanceOf(BadRequestException);
    service.disconnect.mockResolvedValue(true);
    await expect(controller.disconnect(request)).resolves.toBeUndefined();
    expect(service.disconnect.mock.calls).toContainEqual([8]);
  });
});
