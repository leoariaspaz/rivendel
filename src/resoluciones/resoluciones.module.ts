import { Module } from '@nestjs/common';
import { ResolucionesService } from './resoluciones.service';
import { ResolucionesController } from './resoluciones.controller';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [ResolucionesController],
  providers: [ResolucionesService, PrismaService],
})
export class ResolucionesModule {}
