import { ConfigType, registerAs } from '@nestjs/config';
import { envToBool, envToNumber } from './utils';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: envToNumber(process.env.DB_PORT, 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  ssl: envToBool(process.env.DB_SSL),
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
