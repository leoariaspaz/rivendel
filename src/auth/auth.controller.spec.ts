import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { authConfig } from 'src/config/auth.config';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { login: jest.fn(), refreshTokens: jest.fn(), logout: jest.fn() };
  const usersService = { findById: jest.fn() };
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
    const response = { cookie: jest.fn() } as any;
    authService.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    usersService.findById.mockResolvedValue({ nombre: 'Ada' });

    await expect(controller.login({ user: { id: 2, email: 'ada@test.dev' } } as any, response)).resolves.toEqual({
      accessToken: 'access',
      userName: 'Ada',
    });
    expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', cookieOptions);
  });

  it('usa un nombre de usuario alternativo cuando el registro no tiene nombre', async () => {
    authService.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    usersService.findById.mockResolvedValue(null);

    await expect(controller.login({ user: { id: 2, email: 'ada@test.dev' } } as any, { cookie: jest.fn() } as any)).resolves.toMatchObject({
      userName: '[Usuario sin nombre]',
    });
  });

  it('renueva la cookie usando el token de la petición', async () => {
    const response = { cookie: jest.fn() } as any;
    authService.refreshTokens.mockResolvedValue({ accessToken: 'next-access', refreshToken: 'next-refresh' });
    usersService.findById.mockResolvedValue({ nombre: 'Ada' });

    await expect(
      controller.refresh({ user: { userId: 2 }, cookies: { refresh_token: 'old-refresh' } } as any, response)
    ).resolves.toEqual({ accessToken: 'next-access', userName: 'Ada' });
    expect(authService.refreshTokens).toHaveBeenCalledWith(2, 'old-refresh');
    expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'next-refresh', cookieOptions);
  });

  it('tolera una cookie de refresh ausente enviando cadena vacía al servicio', async () => {
    authService.refreshTokens.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    usersService.findById.mockResolvedValue({ nombre: 'Ada' });

    await controller.refresh({ user: { userId: 2 } } as any, { cookie: jest.fn() } as any);
    expect(authService.refreshTokens).toHaveBeenCalledWith(2, '');
  });

  it('revoca la sesión y limpia la cookie', async () => {
    const response = { clearCookie: jest.fn() } as any;
    authService.logout.mockResolvedValue(undefined);

    await expect(controller.logout({ user: { userId: 2 } } as any, response)).resolves.toMatchObject({ ok: true });
    expect(authService.logout).toHaveBeenCalledWith(2);
    expect(response.clearCookie).toHaveBeenCalledWith('refresh_token');
  });
});
