import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { QStashGuard } from 'src/auth/qstash.guard';
import { SkipJwt } from 'src/auth/skip-jwt.decorator';
import { PrismaService } from 'src/shared/services/prisma.service';

@SkipJwt()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return { status: 'ok' };
  }

  @Get('services')
  async services() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'connected' };
  }

  @UseGuards(QStashGuard)
  @Post()
  async start(@Body() _body: any) {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'connected' };
  }
}
