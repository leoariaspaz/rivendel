import { Controller, Get, Query } from '@nestjs/common';
import { SkipJwt } from 'src/auth/skip-jwt.decorator';
import { BankingService } from './banking.service';

@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get('data')
  @SkipJwt()
  bankingData(@Query('alias') alias: string) {
    return this.bankingService.obtenerCbuPorAlias(alias);
  }
}
