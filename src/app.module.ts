import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PatrocinantesModule } from './modules/patrocinantes/patrocinantes.module';
import { TipdocsModule } from './modules/tipdocs/tipdocs.module';
import { PartesModule } from './modules/partes/partes.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    PatrocinantesModule,
    TipdocsModule,
    PartesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
