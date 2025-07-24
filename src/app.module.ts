import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatrocinantesModule } from './patrocinantes/patrocinantes.module';

@Module({
  imports: [PatrocinantesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
