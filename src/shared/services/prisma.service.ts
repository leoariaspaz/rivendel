import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { databaseConfig, type DatabaseConfig } from 'src/config';
import { bool } from 'joi/lib';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static printed: boolean = false;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: DatabaseConfig
  ) {
    if (!PrismaService.printed) {
      console.log(
        `Connecting to database ${config.name} at ${config.host}:${config.port} with ` +
          `user ${config.user} (SSL: ${config.ssl})`
      );
      PrismaService.printed = true;
    }

    const adapter = new PrismaMariaDb({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.name,
      ssl: config.ssl,
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
