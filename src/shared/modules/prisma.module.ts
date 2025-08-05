import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Global()
@Module({
  providers: [PrismaService], // Declares PrismaService as a provider
  exports: [PrismaService], // Makes it available to other modules
})
export class PrismaModule {}
