import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PatrocinantesModule } from './modules/patrocinantes/patrocinantes.module';
import { TipdocsModule } from './modules/tipdocs/tipdocs.module';
import { PartesModule } from './modules/partes/partes.module';
import { ResolucionesModule } from './resoluciones/resoluciones.module';
import { ReclamosModule } from './reclamos/reclamos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/jwt.guard';
import * as Joi from 'joi';
import { authConfig } from './config/auth.config';
import { databaseConfig, jwtConfig } from './config';
import { ValidatorsModule } from './validators/validators.module';

const env = process.env.NODE_ENV || 'local';

@Module({
  imports: [
    PatrocinantesModule,
    TipdocsModule,
    PartesModule,
    ResolucionesModule,
    ReclamosModule,
    AuthModule,
    UsersModule,
    ValidatorsModule,
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: [`.env.${env}`, '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'local')
          .default('local'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().optional(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_SSL: Joi.boolean()
                  .truthy('true', '1', 'yes', 'y')
                  .falsy('false', '0', 'no', 'n')
                  .default(false),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.number().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.number().required(),
        FRONTEND_URL: Joi.string().uri().required(),
      }),
      load: [
        authConfig,
        databaseConfig,
        jwtConfig,        
      ],
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
