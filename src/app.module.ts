import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PatrocinantesModule } from './modules/patrocinantes/patrocinantes.module';
import { TipdocsModule } from './modules/tipdocs/tipdocs.module';
import { PartesModule } from './modules/partes/partes.module';
import { ResolucionesModule } from './resoluciones/resoluciones.module';
import { ReclamosModule } from './reclamos/reclamos.module';
import { PartesReclamosModule } from './partes-reclamos/partes-reclamos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    PatrocinantesModule,
    TipdocsModule,
    PartesModule,
    ResolucionesModule,
    ReclamosModule,
    PartesReclamosModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
