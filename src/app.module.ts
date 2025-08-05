import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PatrocinantesModule } from './modules/patrocinantes/patrocinantes.module';
import { TipdocsModule } from './tipdocs/tipdocs.module';

@Module({
  imports: [ConfigModule.forRoot({}), PatrocinantesModule, TipdocsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
