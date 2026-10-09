import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtGuard } from './jwt.guard';
import { IS_PUBLIC_KEY } from './public.decorator';
import { SKIP_JWT_KEY } from './skip-jwt.decorator';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() =>
    class {
      canActivate() {
        return 'passport-guard';
      }
    }
  ),
}));

describe('JwtGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: JwtGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as any;
    guard = new JwtGuard(reflector);
  });

  const handler = jest.fn();
  const controller = jest.fn();
  const context = { getHandler: () => handler, getClass: () => controller } as unknown as ExecutionContext;

  it('omite JWT para rutas públicas', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === IS_PUBLIC_KEY);
    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [handler, controller]);
  });

  it('omite JWT para rutas marcadas SkipJwt', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === SKIP_JWT_KEY);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('delega la autenticación para rutas protegidas', () => {
    expect(guard.canActivate(context)).toBe('passport-guard');
    expect(AuthGuard).toHaveBeenCalledWith('jwt');
  });
});
