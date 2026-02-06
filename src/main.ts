import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.log(`Starting application in ${process.env.NODE_ENV}...`);

  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const env = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT') as number;

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  console.log(`Configuring CORS for frontend URL: ${frontendUrl}`);
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Si necesitas enviar cookies o cabeceras de autorización
  });
  app.getHttpAdapter().getInstance().set('etag', false); // Deshabilitar ETag
  app.use(cookieParser());  // Middleware para parsear cookies
  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
