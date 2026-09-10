import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BankingService {
  private readonly logger = new Logger(BankingService.name);

  constructor(private readonly httpService: HttpService) {}

  async obtenerCbuPorAlias(alias: string): Promise<any> {
    const url = 'https://plazofijo.bancobica.com.ar/svc/api/coelsa/alias-a-cbu';

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: { alias },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            Accept: 'application/json, text/plain, */*',
          },
        })
      );

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al consultar el alias en Banco Bica: ${message}`);
      return '';
    }
  }
}
