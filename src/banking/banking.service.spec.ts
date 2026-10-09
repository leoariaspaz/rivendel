import { Test, TestingModule } from '@nestjs/testing';
import { BankingService } from './banking.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';

jest.mock('@nestjs/axios', () => ({ HttpService: class HttpService {} }));
jest.mock('axios-cookiejar-support', () => ({ wrapper: jest.fn((client) => client) }));

const mockAxiosClient = { get: jest.fn() };
jest.mock('axios', () => ({
  __esModule: true,
  default: { create: jest.fn(() => mockAxiosClient) },
}));

describe('BankingService', () => {
  let service: BankingService;
  const httpService = { get: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankingService, { provide: HttpService, useValue: httpService }],
    }).compile();

    service = module.get<BankingService>(BankingService);
  });

  it('consulta alias en Bica y devuelve CBU', async () => {
    httpService.get.mockReturnValue(of({ data: { cbu: '000123' } }));
    await expect(service.getCBUFromAlias('ada.alias')).resolves.toBe('000123');
    expect(httpService.get).toHaveBeenCalledWith(
      'https://plazofijo.bancobica.com.ar/svc/api/coelsa/alias-a-cbu',
      expect.objectContaining({ params: { alias: 'ada.alias' }, headers: expect.objectContaining({ Accept: expect.stringContaining('application/json') }) })
    );
  });

  it('devuelve cadena vacía ante error de Bica', async () => {
    httpService.get.mockReturnValue(throwError(() => new Error('request timeout')));
    const log = jest.spyOn((service as any).logger, 'error').mockImplementation(() => undefined);
    await expect(service.getCBUFromAlias('missing.alias')).resolves.toBe('');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('request timeout'));
    log.mockRestore();
  });

  it('convierte errores de Bica que no son instancias Error a texto', async () => {
    httpService.get.mockReturnValue(throwError(() => 'Bica unavailable'));
    const log = jest.spyOn((service as any).logger, 'error').mockImplementation(() => undefined);
    await expect(service.getCBUFromAlias('missing.alias')).resolves.toBe('');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Bica unavailable'));
    log.mockRestore();
  });

  it('inicializa cliente Buho con cookie jar y hace warm-up antes de verificar CBU', async () => {
    mockAxiosClient.get.mockResolvedValueOnce({ data: 'home' }).mockResolvedValueOnce({ data: { titular: 'Ada' } });
    service.onModuleInit();

    await expect(service.getCuentaFromCBU('000123')).resolves.toEqual({ titular: 'Ada' });
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://buhobank.com', withCredentials: true, jar: expect.any(Object) })
    );
    expect(wrapper).toHaveBeenCalledWith(mockAxiosClient);
    expect(mockAxiosClient.get).toHaveBeenNthCalledWith(1, '/', expect.objectContaining({ headers: expect.objectContaining({ Accept: expect.stringContaining('text/html') }) }));
    expect(mockAxiosClient.get).toHaveBeenNthCalledWith(2, '/api/plazoFijo/verificarCBU', {
      params: { cbu: '000123' },
      headers: expect.objectContaining({ 'User-Agent': expect.any(String) }),
    });
  });

  it('omite el warm-up cuando el cookie jar ya contiene una cookie de sesión TS', async () => {
    mockAxiosClient.get.mockResolvedValueOnce({ data: { titular: 'Ada' } });
    service.onModuleInit();
    (service as any).jar.setCookieSync('TSsession=active; Path=/onboarding', 'https://buhobank.com/onboarding');

    await expect(service.getCuentaFromCBU('000456')).resolves.toEqual({ titular: 'Ada' });
    expect(mockAxiosClient.get).toHaveBeenCalledTimes(1);
    expect(mockAxiosClient.get).toHaveBeenCalledWith('/api/plazoFijo/verificarCBU', {
      params: { cbu: '000456' },
      headers: expect.objectContaining({ 'User-Agent': expect.any(String) }),
    });
  });

  it('detiene verificación si falla warm-up y devuelve undefined', async () => {
    mockAxiosClient.get.mockRejectedValueOnce(new Error('warm-up failed'));
    service.onModuleInit();
    const log = jest.spyOn((service as any).logger, 'error').mockImplementation(() => undefined);

    await expect(service.getCuentaFromCBU('000123')).resolves.toBeUndefined();
    expect(mockAxiosClient.get).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('warm-up failed'));
    log.mockRestore();
  });

  it('devuelve undefined cuando falla la API Buho luego del warm-up', async () => {
    mockAxiosClient.get.mockResolvedValueOnce({ data: 'home' }).mockRejectedValueOnce(new Error('CBU timeout'));
    service.onModuleInit();
    const log = jest.spyOn((service as any).logger, 'error').mockImplementation(() => undefined);

    await expect(service.getCuentaFromCBU('000123')).resolves.toBeUndefined();
    expect(mockAxiosClient.get).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('CBU timeout'));
    log.mockRestore();
  });

  it('convierte errores de Buho que no son instancias Error a texto', async () => {
    mockAxiosClient.get.mockResolvedValueOnce({ data: 'home' }).mockRejectedValueOnce('Buho unavailable');
    service.onModuleInit();
    const log = jest.spyOn((service as any).logger, 'error').mockImplementation(() => undefined);

    await expect(service.getCuentaFromCBU('000123')).resolves.toBeUndefined();
    expect(mockAxiosClient.get).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Buho unavailable'));
    log.mockRestore();
  });
});
