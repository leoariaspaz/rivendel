import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatrocinantesModule } from './patrocinantes/patrocinantes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PatrocinantesModule,
    ConfigModule.forRoot({
      envFilePath: ['.local.env'],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
