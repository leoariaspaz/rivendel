import { Module } from '@nestjs/common';
import { PatrocinantesService } from './patrocinantes.service';
import { PatrocinantesController } from './patrocinantes.controller';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [PatrocinantesController],
  providers: [PatrocinantesService, PrismaService],
})
export class PatrocinantesModule {}
