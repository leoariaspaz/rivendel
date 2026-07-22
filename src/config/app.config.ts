import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'local',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

export type AppConfig = ConfigType<typeof appConfig>;
