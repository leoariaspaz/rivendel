import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter';

async function bootstrap() {
  console.log('Starting application in ' + process.env.NODE_ENV);
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
