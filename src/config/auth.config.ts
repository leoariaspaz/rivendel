import { ConfigType, registerAs } from '@nestjs/config';
import { envToBool } from './utils';

function getSameSite(value?: string): 'strict' | 'lax' | 'none' {
  if (value === 'lax' || value === 'none' || value === 'strict') {
    return value;
  }
  return 'strict';
}

export const authConfig = registerAs('auth', () => ({
  refreshCookieOptions: {
    httpOnly: true,
    sameSite: getSameSite(process.env.SAME_SITE),
    secure: envToBool(process.env.USE_SECURE_COOKIES),
    path: process.env.PATH_REFRESH_TOKEN || '/',
    maxAge: parseInt(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || '0', 10),
  },
}));

export type AuthConfig = ConfigType<typeof authConfig>;
