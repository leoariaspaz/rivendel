import { Controller, Get, Query } from '@nestjs/common';
import { SkipJwt } from 'src/auth/skip-jwt.decorator';
import { BankingService } from './banking.service';

@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get('data')
  @SkipJwt()
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
