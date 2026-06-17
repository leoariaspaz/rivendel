import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
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
      const dbUrl = new URL(config.dbUrl!);

      const DB_HOST = dbUrl.hostname;
      const DB_PORT = dbUrl.port || '3306';
      const DB_NAME = dbUrl.pathname.replace(/^\//, '');
      const DB_SSL_ACCEPT = dbUrl.searchParams.get('sslaccept') || false;
      const DB_CERT = config.dbCertificate?.substring(0, 19).concat('...');

      const logger = new Logger(PrismaService.name);
      logger.log(
        `Connecting to database ${DB_NAME} at ${DB_HOST}:${DB_PORT} with (SSL: ${DB_SSL_ACCEPT}) (CERT: ${DB_CERT})`
      );
      PrismaService.printed = true;
    }

    super({
      datasourceUrl: config.dbUrl,
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
