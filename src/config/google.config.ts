import { ConfigType, registerAs } from '@nestjs/config';

export const googleConfig = registerAs('google', () => ({
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
}));

export type GoogleConfig = ConfigType<typeof googleConfig>;
