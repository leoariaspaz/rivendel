import { envToBool, envToNumber } from './utils';
import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { jwtConfig } from './jwt.config';
import { databaseConfig } from './database.config';
import { googleConfig } from './google.config';
import { qstashConfig } from './qstash.config';

describe('configuración de entorno', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('convierte booleanos y números, conservando defaults para valores ausentes o inválidos', () => {
    expect(envToBool(undefined, true)).toBe(true);
    expect(['true', '1', 'yes', 'y'].map((value) => envToBool(value))).toEqual([true, true, true, true]);
    expect(envToBool('TRUE')).toBe(true);
    expect(envToBool('no')).toBe(false);
    expect(envToNumber(undefined, 12)).toBe(12);
    expect(envToNumber('20', 12)).toBe(20);
    expect(envToNumber('nope', 12)).toBe(12);
  });

  it('parsea allowed origins como lista o regex', () => {
    process.env.ALLOWED_ORIGINS = ' https://one.test, https://two.test ';
    expect(appConfig().allowedOrigins).toEqual(['https://one.test', 'https://two.test']);
    process.env.ALLOWED_ORIGINS = '/^https:\\/\\/.*\\.test$/i';
    const allowed = appConfig().allowedOrigins as RegExp;
    expect(allowed).toBeInstanceOf(RegExp);
    expect(allowed.test('https://app.test')).toBe(true);
    expect(allowed.test('http://app.test')).toBe(false);
  });

  it('aplica defaults de app, database y JWT cuando faltan variables', () => {
    delete process.env.NODE_ENV;
    delete process.env.FRONTEND_URL;
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_CA_TEMP_PATH;
    delete process.env.DATABASE_CA_NAME;
    delete process.env.JWT_ACCESS_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_IN;

    expect(appConfig()).toMatchObject({ nodeEnv: 'local', frontendUrl: 'http://localhost:5173' });
    expect(databaseConfig()).toMatchObject({ dbUrl: '', dbCertPath: '/temp', dbCertName: 'ca.pem' });
    expect(jwtConfig()).toMatchObject({ access: { expiresIn: 900 }, refresh: { expiresIn: 604800 } });
  });

  it('configura cookie httpOnly, secure, sameSite y partitioned según el entorno', () => {
    process.env.SAME_SITE = 'none';
    process.env.USE_SECURE_COOKIES = 'true';
    process.env.PATH_REFRESH_TOKEN = '/auth/refresh';
    process.env.REFRESH_TOKEN_COOKIE_MAX_AGE = '1234';
    expect(authConfig().refreshCookieOptions).toEqual({
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/auth/refresh',
      maxAge: 1234,
      partitioned: true,
    });
    process.env.SAME_SITE = 'unknown';
    process.env.USE_SECURE_COOKIES = 'false';
    expect(authConfig().refreshCookieOptions).toMatchObject({ sameSite: 'strict', secure: false, partitioned: false });
    delete process.env.PATH_REFRESH_TOKEN;
    delete process.env.REFRESH_TOKEN_COOKIE_MAX_AGE;
    expect(authConfig().refreshCookieOptions).toMatchObject({ path: '/', maxAge: 0 });
  });

  it('lee credenciales externas opcionales y claves QStash desde variables', () => {
    process.env.GOOGLE_CLIENT_ID = 'google-client';
    process.env.GOOGLE_CLIENT_SECRET = '';
    process.env.GOOGLE_REDIRECT_URI = '';
    process.env.QSTASH_CURRENT_SIGNING_KEY = 'current';
    process.env.QSTASH_NEXT_SIGNING_KEY = 'next';

    expect(googleConfig()).toEqual({
      googleClientId: 'google-client',
      googleClientSecret: '',
      googleRedirectUri: '',
    });
    expect(qstashConfig()).toEqual({ currentKey: 'current', nextKey: 'next' });
  });
});
