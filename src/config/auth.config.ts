import { ConfigType, registerAs } from '@nestjs/config';
import { envToBool } from './utils';

export const authConfig = registerAs('auth', () => ({
  refreshCookieOptions: {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: envToBool(process.env.USE_SECURE_COOKIES),
    path: process.env.PATH_REFRESH_TOKEN || '/',
    maxAge: parseInt(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || '0', 10),
  },
}));

export type AuthConfig = ConfigType<typeof authConfig>;
