import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PatrocinantesModule } from './patrocinantes/patrocinantes.module';
import { TipdocsModule } from './tipdocs/tipdocs.module';
import { PartesModule } from './partes/partes.module';
import { ReclamosModule } from './reclamos/reclamos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/jwt.guard';
import * as Joi from 'joi';
import { authConfig } from './config/auth.config';
import { databaseConfig, jwtConfig } from './config';
import { ValidatorsModule } from './validators/validators.module';

@Module({
  imports: [
    PatrocinantesModule,
    TipdocsModule,
    PartesModule,
    ReclamosModule,
    AuthModule,
    UsersModule,
    ValidatorsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test', 'local').default('local'),
        PORT: Joi.number().default(3000),
        FRONTEND_URL: Joi.string().uri().required(),
        DATABASE_URL: Joi.string().required(),
        DATABASE_CA_CERT: Joi.string().optional(),
        DATABASE_CA_TEMP_PATH: Joi.string().optional(),
        DATABASE_CA_NAME: Joi.string().optional(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.number().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.number().required(),
        SAME_SITE: Joi.string().valid('lax', 'none', 'strict').optional(),
        USE_SECURE_COOKIES: Joi.boolean().required(),
        PATH_REFRESH_TOKEN: Joi.string().required(),
        REFRESH_TOKEN_COOKIE_MAX_AGE: Joi.number().required(),
      }),
      load: [authConfig, databaseConfig, jwtConfig],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
