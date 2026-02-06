import { ConfigType, registerAs } from '@nestjs/config';

const envToBool = (value?: string, defaultValue = false): boolean => {
  if (value === undefined) return defaultValue;
  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
};

export const authConfig = registerAs('auth', () => ({
  refreshCookieOptions: {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: envToBool(process.env.USE_SECURE_COOKIES),
    path: '/auth/refresh',
  },
}));

export type AuthConfig = ConfigType<typeof authConfig>;