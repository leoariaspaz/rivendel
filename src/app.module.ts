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
import { authConfig } from './config/auth.config';
import { databaseConfig, googleConfig, jwtConfig, qstashConfig } from './config';
import { envValidationSchema } from './config/env-validation.schema';
import { ValidatorsModule } from './validators/validators.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { appConfig } from './config/app.config';
import { HealthModule } from './health/health.module';
import { HttpModule } from '@nestjs/axios';
import { BankingService } from './banking/banking.service';
import { BankingController } from './banking/banking.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
      validationSchema: envValidationSchema,
      load: [authConfig, databaseConfig, jwtConfig, googleConfig, appConfig, qstashConfig],
    }),
    GoogleCalendarModule,
    HealthModule,
    HttpModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // 100 req/min por IP
  ],
  controllers: [AppController, BankingController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtGuard },
    BankingService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
