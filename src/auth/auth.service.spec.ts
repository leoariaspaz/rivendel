import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/config';
import * as bcrypt from 'bcryptjs';
import { JwtSignOptions } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    create: jest.fn<Promise<{ id: number }>, [string, string, string]>(),
    saveRefreshToken: jest.fn<Promise<void>, [number, string]>(),
    clearRefreshToken: jest.fn<Promise<void>, [number]>(),
    findById: jest.fn<Promise<{ id: number; email?: string; refreshToken: string | null } | null>, [number]>(),
  };
  const jwtService = {
    signAsync: jest.fn<Promise<string>, [object, JwtSignOptions?]>(),
  };
  const config = { access: { secret: 'access', expiresIn: 900 }, refresh: { secret: 'refresh', expiresIn: 3600 } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: jwtConfig.KEY, useValue: config },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registra usando una contraseña hasheada', async () => {
    const hash = await bcrypt.hash('plain-password', 4);
    usersService.create.mockResolvedValue({ id: 8 });

    await expect(service.register('user@test.dev', 'plain-password', 'Ada')).resolves.toEqual({ id: 8 });
    const [email, storedPassword, name] = usersService.create.mock.calls[0];
    expect([email, name]).toEqual(['user@test.dev', 'Ada']);
    await expect(bcrypt.compare('plain-password', storedPassword)).resolves.toBe(true);
    expect(storedPassword).not.toBe('plain-password');
    expect(hash).not.toBe('plain-password');
  });

  it('firma tokens y persiste solo el hash del refresh token', async () => {
    jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

    await expect(service.login({ id: 12, email: 'user@test.dev' })).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(jwtService.signAsync.mock.calls[0]).toEqual([{ email: 'user@test.dev', sub: 12 }]);
    expect(jwtService.signAsync.mock.calls[1]).toEqual([
      { email: 'user@test.dev', sub: 12 },
      {
        secret: 'refresh',
        expiresIn: 3600,
      },
    ]);
    const [userId, storedHash] = usersService.saveRefreshToken.mock.calls[0];
    expect(userId).toBe(12);
    expect(storedHash).not.toBe('refresh-token');
    await expect(bcrypt.compare('refresh-token', storedHash)).resolves.toBe(true);
  });

  it('cierra sesión limpiando el refresh token', async () => {
    usersService.clearRefreshToken.mockResolvedValue(undefined);
    await expect(service.logout(12)).resolves.toBeUndefined();
    expect(usersService.clearRefreshToken.mock.calls).toContainEqual([12]);
  });

  it('rechaza un refresh inválido y revoca el hash guardado', async () => {
    usersService.findById.mockResolvedValue({ id: 12, refreshToken: await bcrypt.hash('other-token', 4) });

    await expect(service.refreshTokens(12, 'bad-token')).rejects.toThrow('Token inválido');
    expect(usersService.clearRefreshToken.mock.calls).toContainEqual([12]);
    expect(jwtService.signAsync.mock.calls).toHaveLength(0);
  });

  it('rota tokens para un refresh válido', async () => {
    usersService.findById.mockResolvedValue({
      id: 12,
      email: 'user@test.dev',
      refreshToken: await bcrypt.hash('refresh-token', 4),
    });
    jwtService.signAsync.mockResolvedValueOnce('next-access').mockResolvedValueOnce('next-refresh');

    await expect(service.refreshTokens(12, 'refresh-token')).resolves.toEqual({
      accessToken: 'next-access',
      refreshToken: 'next-refresh',
    });
    expect(usersService.saveRefreshToken.mock.calls).toHaveLength(1);
  });

  it('rechaza una cuenta inexistente sin emitir tokens', async () => {
    usersService.findById
      .mockResolvedValueOnce({ id: 12, refreshToken: await bcrypt.hash('refresh-token', 4) })
      .mockResolvedValueOnce(null);

    await expect(service.refreshTokens(12, 'refresh-token')).rejects.toThrow('El usuario no existe.');
    expect(jwtService.signAsync.mock.calls).toHaveLength(0);
  });

  it('compara y genera hashes de contraseña', async () => {
    const hash = await service.hashPasword('password');
    await expect(service.validateUserPassword('password', hash)).resolves.toBe(true);
    await expect(service.validateUserPassword('wrong', hash)).resolves.toBe(false);
  });
});
