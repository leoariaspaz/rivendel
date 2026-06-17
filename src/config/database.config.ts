import { ConfigType, registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  dbUrl: process.env.DATABASE_URL,
  dbCertificate: process.env.DATABASE_CA_CERT,
  dbCertPath: process.env.DATABASE_CA_TEMP_PATH || '/temp',
  dbCertName: process.env.DATABASE_CA_NAME || 'ca.pem',
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
