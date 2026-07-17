import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService, UsersService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
