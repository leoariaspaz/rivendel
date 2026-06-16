import { ConfigType, registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  certified: process.env.DATABASE_CA_CERT,
  tempPath: process.env.DATABASE_TEMP_PATH || '/temp',
  certifiedName: process.env.DATABASE_CA_NAME || 'ca.pem',
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
