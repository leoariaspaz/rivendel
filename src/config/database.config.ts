import { ConfigType, registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  dbUrl: process.env.DATABASE_URL ?? '',
  dbCertPath: process.env.DATABASE_CA_TEMP_PATH ?? '/temp',
  dbCertificate: process.env.DATABASE_CA_CERT,
  dbCertName: process.env.DATABASE_CA_NAME ?? 'ca.pem',
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
