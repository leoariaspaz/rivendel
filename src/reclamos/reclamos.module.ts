import { Module } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamosController } from './reclamos.controller';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';

@Module({
  controllers: [ReclamosController],
  providers: [ReclamosService, PrismaService, ResolucionesService, GoogleCalendarService],
})
export class ReclamosModule {}
