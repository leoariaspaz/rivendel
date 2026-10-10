import { envValidationSchema } from './env-validation.schema';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

describe('envValidationSchema', () => {
  const validEnvironment = {
    FRONTEND_URL: 'https://frontend.example.test',
    DATABASE_URL: 'mysql://user:password@db.example.test:3306/app',
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_ACCESS_EXPIRES_IN: '900',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_REFRESH_EXPIRES_IN: '604800',
    USE_SECURE_COOKIES: 'true',
    PATH_REFRESH_TOKEN: '/auth/refresh',
    REFRESH_TOKEN_COOKIE_MAX_AGE: '604800000',
    GOOGLE_CLIENT_ID: 'client-id',
    GOOGLE_CLIENT_SECRET: 'client-secret',
    GOOGLE_REDIRECT_URI: 'https://api.example.test/callback',
    QSTASH_CURRENT_SIGNING_KEY: 'current-key',
    QSTASH_NEXT_SIGNING_KEY: 'next-key',
  };

  it('acepta configuración completa, convierte números y aplica defaults', () => {
    const result = envValidationSchema.validate(validEnvironment);
    const value: unknown = result.value;
    expect(result.error).toBeUndefined();
    if (!isRecord(value)) throw new Error('La configuración validada debe ser un objeto');
    expect(value['NODE_ENV']).toBe('local');
    expect(value['PORT']).toBe(3000);
    expect(value['USE_SECURE_COOKIES']).toBe(true);
    expect(value['JWT_ACCESS_EXPIRES_IN']).toBe(900);
    expect(value['ALLOWED_ORIGINS']).toBe('http://localhost:5173');
  });

  it.each([
    ['FRONTEND_URL'],
    ['DATABASE_URL'],
    ['JWT_ACCESS_SECRET'],
    ['JWT_REFRESH_SECRET'],
    ['GOOGLE_CLIENT_ID'],
    ['GOOGLE_REDIRECT_URI'],
    ['QSTASH_CURRENT_SIGNING_KEY'],
    ['QSTASH_NEXT_SIGNING_KEY'],
  ])('rechaza si falta la variable requerida %s', (name) => {
    const config: Record<string, string> = { ...validEnvironment };
    delete config[name];
    const { error } = envValidationSchema.validate(config);
    expect(error?.details.some((detail) => detail.path.includes(name))).toBe(true);
  });

  it('rechaza URI y valores de entorno fuera del conjunto permitido', () => {
    expect(envValidationSchema.validate({ ...validEnvironment, FRONTEND_URL: 'not-a-url' }).error).toBeDefined();
    expect(envValidationSchema.validate({ ...validEnvironment, NODE_ENV: 'test' }).error).toBeDefined();
    expect(envValidationSchema.validate({ ...validEnvironment, SAME_SITE: 'invalid' }).error).toBeDefined();
  });
});
