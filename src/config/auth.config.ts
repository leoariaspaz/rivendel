import { ConfigType, registerAs } from '@nestjs/config';
import { envToBool } from './utils';

export const authConfig = registerAs('auth', () => ({
  refreshCookieOptions: {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: envToBool(process.env.USE_SECURE_COOKIES),
    path: '/auth/refresh',
  },
}));

export type AuthConfig = ConfigType<typeof authConfig>;