import { Controller, Get } from '@nestjs/common';
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
}
