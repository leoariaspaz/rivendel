import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { jwtConfig } from 'src/config';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtStrategy } from './jwt-refresh.strategy';
import { LocalStrategy } from './local.strategy';
import * as bcrypt from 'bcryptjs';

describe('Passport strategies', () => {
  const config = {
    access: { secret: 'access-secret', expiresIn: 900 },
    refresh: { secret: 'refresh-secret', expiresIn: 604800 },
  };

  it('mapea subject de JWT de acceso y refresh al userId', async () => {
    const module = await Test.createTestingModule({
      providers: [JwtStrategy, RefreshJwtStrategy, { provide: jwtConfig.KEY, useValue: config }],
    }).compile();
    expect(module.get(JwtStrategy).validate({ sub: 17 })).toEqual({ userId: 17 });
    expect(module.get(RefreshJwtStrategy).validate({ sub: 18 })).toEqual({ userId: 18 });
  });

  it('localiza usuario por email, rechaza credenciales inválidas y no retorna password', async () => {
    const users = { findByEmail: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [LocalStrategy, { provide: UsersService, useValue: users }],
    }).compile();
    const strategy = module.get(LocalStrategy);
    users.findByEmail.mockResolvedValue(null);
    await expect(strategy.validate('missing@test.dev', 'secret')).rejects.toBeInstanceOf(UnauthorizedException);
    users.findByEmail.mockResolvedValue({ id: 1, email: 'ada@test.dev', password: await bcrypt.hash('secret', 4) });
    await expect(strategy.validate('ada@test.dev', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(strategy.validate('ada@test.dev', 'secret')).resolves.toEqual({ id: 1, email: 'ada@test.dev' });
    expect(users.findByEmail).toHaveBeenCalledWith('ada@test.dev');
  });
});
