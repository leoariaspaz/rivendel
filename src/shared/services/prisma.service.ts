import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import "dotenv/config";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    console.log('Connecting to database ' + process.env.DB_NAME + ' at ' + 
      process.env.DB_HOST + ':' + process.env.DB_PORT + ' with user ' + process.env.DB_USER);
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    super({ adapter });
  }
}
