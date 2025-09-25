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

@Module({
  imports: [
    ConfigModule.forRoot({}),
    PatrocinantesModule,
    TipdocsModule,
    PartesModule,
    ResolucionesModule,
    ReclamosModule,
    PartesReclamosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
