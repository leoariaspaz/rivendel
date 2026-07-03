import { ConfigType, registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  dbUrl: `mysql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}${process.env.DATABASE_PARAMS || ''}`,
  dbCertificate: process.env.DATABASE_CA_CERT,
  dbCertPath: process.env.DATABASE_CA_TEMP_PATH || '/temp',
  dbCertName: process.env.DATABASE_CA_NAME || 'ca.pem',
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
