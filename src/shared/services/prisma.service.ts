import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import "dotenv/config";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    console.log('Connecting to database ' + process.env.DB_NAME + ' at ' + 
      process.env.DB_HOST + ':' + process.env.DB_PORT + ' with user ' + process.env.DB_USER + 
      ' (SSL: ' + PrismaService.envToBool(process.env.USE_SSL) + ')');
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: PrismaService.envToBool(process.env.USE_SSL),
    });
    super({ adapter });
  }

  static envToBool(value?: string, defaultValue = false): boolean {
    if (value === undefined) return defaultValue;

    return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
  }  
}
