import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    const dbHost = config.get<string>('DB_HOST');
    const dbPort = config.get<number>('DB_PORT');
    const dbUser = config.get<string>('DB_USER');
    const dbPassword = config.get<string>('DB_PASSWORD');
    const dbName = config.get<string>('DB_NAME');
    const useSsl = config.get<boolean>('DB_SSL');

    console.log(`Connecting to database ${dbName} at ${dbHost}:${dbPort} with user ${dbUser} (SSL: ${useSsl})`);
    const adapter = new PrismaMariaDb({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: useSsl,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
