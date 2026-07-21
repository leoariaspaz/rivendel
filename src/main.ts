import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { AppService } from './app.service';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const appService = new AppService();
  appService.loadDBCertificate();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, appService.configureOptions());
  const logger = new Logger();

  logger.debug(`Starting application in ${process.env.NODE_ENV}...`);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') as number;

  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  appService.enableCors(app, logger);
  app.getHttpAdapter().getInstance().set('etag', false); // Deshabilitar ETag
  app.use(cookieParser()); // Middleware para parsear cookies

  appService.configureSwagger(app);

  logger.debug(`Escuchando en puerto ${port}`);
  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
