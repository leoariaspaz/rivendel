import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BankingData } from './dto/banking-data';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const BUHOBANK_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0';

const BUHOBANK_HEADERS = {
  'User-Agent': BUHOBANK_USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
};

@Injectable()
export class BankingService implements OnModuleInit {
  private readonly logger = new Logger(BankingService.name);
  private client!: AxiosInstance;
  private jar!: CookieJar;

  constructor(private readonly httpService: HttpService) {}

  async getCBUFromAlias(alias: string): Promise<string> {
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

      const { cbu } = response.data as { cbu: string };
      return cbu;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al consultar el alias en Banco Bica: ${message}`);
      return '';
    }
  }

  onModuleInit() {
    this.jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        jar: this.jar,
        withCredentials: true,
        baseURL: 'https://buhobank.com',
      })
    );
  }

  private async ensureSession(): Promise<void> {
    const cookies = await this.jar.getCookies('https://buhobank.com/onboarding');
    const hasSession = cookies.some((c) => c.key.startsWith('TS'));
    if (hasSession) return;

    await this.client.get('/', { headers: BUHOBANK_HEADERS });
  }

  async getCuentaFromCBU(cbu: string): Promise<BankingData | undefined> {
    try {
      await this.ensureSession();

      const response = await this.client.get('/api/plazoFijo/verificarCBU', {
        params: { cbu },
        headers: BUHOBANK_HEADERS,
      });

      return response.data as BankingData;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al consultar el CBU en Buho Bank: ${message}`);
      return undefined;
    }
  }
}
