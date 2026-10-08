import { Controller, Get, Query } from '@nestjs/common';
import { BankingService } from './banking.service';
import { Throttle } from '@nestjs/throttler';

@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Get('data')
  async bankingData(@Query('alias') alias: string) {
    const cbu = await this.bankingService.getCBUFromAlias(alias);
    const data = await this.bankingService.getCuentaFromCBU(cbu);
    if (!data) return;
    return {
      cuenta: data.cuenta,
      bancoDestino: data.nombreBancoDestino,
      titular: data.nombreTitular,
      cuilTitular: data.titulares[0]?.idTributario ?? '',
    };
  }
}
