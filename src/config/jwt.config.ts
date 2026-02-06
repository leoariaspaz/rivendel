import { ConfigType, registerAs } from '@nestjs/config';
import { envToNumber } from './utils';

export const jwtConfig = registerAs('jwt', () => ({
  access: {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: envToNumber(process.env.JWT_ACCESS_EXPIRES_IN, 900), // 15m en seg
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: envToNumber(process.env.JWT_REFRESH_EXPIRES_IN, 60 * 60 * 24 * 7), // 7d en seg
  },
}));

export type JwtConfig = ConfigType<typeof jwtConfig>;
