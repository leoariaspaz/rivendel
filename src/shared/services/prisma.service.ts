import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from 'src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { databaseConfig, type DatabaseConfig } from 'src/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static printed: boolean = false;
  private readonly logger = new Logger(PrismaService.name);

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

    super({ 
      adapter, 
      log: [ 
        { 
          emit: 'event', 
          level: 'query'
        } 
      ] 
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.logger.debug(`Query: ${e.query}`);
      this.logger.debug(`Params: ${e.params}`);
      this.logger.debug(`Duration: ${e.duration}ms`);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
