import { Module } from '@nestjs/common';
import { PartesReclamosService } from './partes-reclamos.service';
import { PartesReclamosController } from './partes-reclamos.controller';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [PartesReclamosController],
  providers: [PartesReclamosService, PrismaService],
})
export class PartesReclamosModule {}
