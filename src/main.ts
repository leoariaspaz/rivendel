import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  console.log(`Starting application in ${process.env.NODE_ENV}...`);

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') as number;

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  console.log(`Configuring CORS for frontend URL: ${frontendUrl}`);
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Si necesitas enviar cookies o cabeceras de autorización
  });
  app.getHttpAdapter().getInstance().set('etag', false); // Deshabilitar ETag
  app.use(cookieParser()); // Middleware para parsear cookies
  
  configurarSwagger(app);

  await app.listen(port);
}

function configurarSwagger(app) {
  const config = new DocumentBuilder()
    .setTitle('Rivendel API')
    .setDescription('Sistema de gestión de reclamos y resoluciones')
    .setVersion('1.0')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'access-token',
    )
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Se define la ruta de la documentación (ej. http://localhost:3000/docs)
  SwaggerModule.setup('docs', app, document);
}  

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
