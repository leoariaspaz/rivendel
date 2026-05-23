import { Module } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamosController } from './reclamos.controller';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';
import { PartesReclamosExtensions } from 'src/partes-reclamos/partes-reclamos.extension';

@Module({
  controllers: [ReclamosController],
  providers: [ReclamosService, PrismaService, ResolucionesService, PartesReclamosExtensions],
})
export class ReclamosModule {}
