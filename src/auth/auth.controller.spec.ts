import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { authConfig } from 'src/config/auth.config';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { UserRequest } from './dto/user-request';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn<Promise<{ accessToken: string; refreshToken: string }>, [{ id: number; email: string }]>(),
    refreshTokens: jest.fn<Promise<{ accessToken: string; refreshToken: string }>, [number, string]>(),
    logout: jest.fn<Promise<void>, [number]>(),
  };
  const usersService = {
    findById: jest.fn<Promise<{ nombre?: string | null } | null>, [number]>(),
  };
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'none' as const,
    secure: true,
    partitioned: true,
    path: '/auth/refresh',
    maxAge: 60000,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: authConfig.KEY, useValue: { refreshCookieOptions: cookieOptions } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('inicia sesión y emite refresh cookie con las opciones seguras configuradas', async () => {
    const response = mockDeep<Response>();
    authService.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    usersService.findById.mockResolvedValue({ nombre: 'Ada' });

    await expect(controller.login({ user: { id: 2, email: 'ada@test.dev' } }, response)).resolves.toEqual({
      accessToken: 'access',
      userName: 'Ada',
    });
    expect(response.cookie.mock.calls).toContainEqual(['refresh_token', 'refresh', cookieOptions]);
  });

  it('usa un nombre de usuario alternativo cuando el registro no tiene nombre', async () => {
    authService.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    usersService.findById.mockResolvedValue(null);

    await expect(
      controller.login({ user: { id: 2, email: 'ada@test.dev' } }, mockDeep<Response>())
    ).resolves.toMatchObject({
      userName: '[Usuario sin nombre]',
    });
  });

  it('renueva la cookie usando el token de la petición', async () => {
    const response = mockDeep<Response>();
    authService.refreshTokens.mockResolvedValue({ accessToken: 'next-access', refreshToken: 'next-refresh' });
    usersService.findById.mockResolvedValue({ nombre: 'Ada' });

    const request = mockDeep<UserRequest>();
    request.user = { userId: 2 };
    request.cookies = { refresh_token: 'old-refresh' };
    await expect(controller.refresh(request, response)).resolves.toEqual({
      accessToken: 'next-access',
      userName: 'Ada',
    });
    expect(authService.refreshTokens.mock.calls).toContainEqual([2, 'old-refresh']);
    expect(response.cookie.mock.calls).toContainEqual(['refresh_token', 'next-refresh', cookieOptions]);
  });

  it('tolera una cookie de refresh ausente enviando cadena vacía al servicio', async () => {
    authService.refreshTokens.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    usersService.findById.mockResolvedValue({ nombre: 'Ada' });

    const request = mockDeep<UserRequest>();
    request.user = { userId: 2 };
    request.cookies = undefined;
    await controller.refresh(request, mockDeep<Response>());
    expect(authService.refreshTokens.mock.calls).toContainEqual([2, '']);
  });

  it('revoca la sesión y limpia la cookie', async () => {
    const response = mockDeep<Response>();
    authService.logout.mockResolvedValue(undefined);

    const request = mockDeep<UserRequest>();
    request.user = { userId: 2 };
    await expect(controller.logout(request, response)).resolves.toMatchObject({ ok: true });
    expect(authService.logout.mock.calls).toContainEqual([2]);
    expect(response.clearCookie.mock.calls).toContainEqual(['refresh_token']);
  });
});
