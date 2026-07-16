import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { PrismaService } from 'src/shared/services/prisma.service';

@Module({
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService, PrismaService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
