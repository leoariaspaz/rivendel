import { Module } from '@nestjs/common';
import { PatrocinantesService } from './patrocinantes.service';
import { PatrocinantesController } from './patrocinantes.controller';

@Module({
  controllers: [PatrocinantesController],
  providers: [PatrocinantesService],
})
export class PatrocinantesModule {}
