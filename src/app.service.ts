import { INestApplication, Injectable, LoggerService, NestApplicationOptions } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fs from 'node:fs';
import path from 'node:path';
import { databaseConfig } from './config';

@Injectable()
export class AppService {
  configureOptions(): NestApplicationOptions {
    return { logger: this.configureLogs() };
  }

  private configureLogs(): LoggerService {
    const transports: winston.transport[] = [];

    // Configuración para los logs combinados rotados por tamaño
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true, // Comprime los archivos viejos en formato .gz para ahorrar espacio

        maxSize: '20m', // 20 Megabytes (acepta 'k', 'm', 'g')
        maxFiles: '30d', // máximo de 30 días (acepta un número puro N "máximo N archivos")

        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, context, level, message }) => {
            const ctx = String(context) ? String(context) : 'App';
            return `${String(timestamp)} | ${ctx} | ${level.toUpperCase()} | ${String(message)}`;
          })
        ),
      })
    );

    transports.push(
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '10m', // Los errores se rotan cada 10MB
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, context, level, message }) => {
            const ctx = String(context) ? String(context) : 'App';
            return `${String(timestamp)} | ${ctx} | ${level.toUpperCase()} | ${String(message)}`;
          })
        ),
      })
    );

    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.ms(), // Opcional: muestra el tiempo entre logs, típico de Nest
          winston.format.printf(
            ({ timestamp, level, message, context }) =>
              `${String(timestamp)} [${level.toUpperCase()}]: ${this.getContext(context)}${String(message)}`
          ),
          winston.format.colorize({ all: true }) //
        ),
      })
    );

    return WinstonModule.createLogger({ transports });
  }

  private getContext = (context) => {
    if (typeof context === 'string' || typeof context === 'number') return `[${context}] `;
    if (context !== undefined && context !== null) return `[${JSON.stringify(context)}] `;
    return '';
  };

  configureSwagger(app: INestApplication<any>) {
    const config = new DocumentBuilder()
      .setTitle('Rivendel API')
      .setDescription('Sistema de gestión de reclamos y resoluciones')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Ingrese su token JWT',
          in: 'header',
        },
        'access-token'
      )
      .addCookieAuth('refresh_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('/', app, document);
  }

  loadDBCertificate() {
    const config = databaseConfig();
    if (config.dbCertificate) {
      const caPath = path.join(config.dbCertPath, config.dbCertName);
      fs.writeFileSync(caPath, config.dbCertificate);
      process.env.NODE_EXTRA_CA_CERTS = caPath;
    }
  }
}
