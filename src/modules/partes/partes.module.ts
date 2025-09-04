import { Module } from '@nestjs/common';
import { PartesService } from './partes.service';
import { PartesController } from './partes.controller';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [PartesController],
  providers: [PartesService, PrismaService],
})
export class PartesModule {}
