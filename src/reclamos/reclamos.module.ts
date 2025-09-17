import { Module } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamosController } from './reclamos.controller';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [ReclamosController],
  providers: [ReclamosService, PrismaService],
})
export class ReclamosModule {}
