import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PartesReclamosExtensions } from './partes-reclamos-extensions';

@Module({
  providers: [PartesReclamosExtensions, PrismaService],
})
export class ReclamosModule {}
