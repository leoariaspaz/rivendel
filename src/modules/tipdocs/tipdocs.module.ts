import { Module } from '@nestjs/common';
import { TipdocsService } from './tipdocs.service';
import { TipdocsController } from './tipdocs.controller';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TipdocsController],
  providers: [PrismaService, TipdocsService],
})
export class TipdocsModule {}
