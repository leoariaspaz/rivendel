import { Test, TestingModule } from '@nestjs/testing';
import { BankingService } from './banking.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import axios, { AxiosHeaders, AxiosInstance, AxiosResponse } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@nestjs/axios', () => ({ HttpService: class HttpService {} }));
jest.mock('axios-cookiejar-support', () => ({
  wrapper: jest.fn((client: AxiosInstance): AxiosInstance => client),
}));

const mockAxiosClient = mockDeep<AxiosInstance>();
const axiosGet = jest.spyOn(mockAxiosClient, 'get');
const axiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: new AxiosHeaders() },
});
jest.mock('axios', () => {
  const actualAxios = jest.requireActual<typeof import('axios')>('axios');
  return {
    ...actualAxios,
    __esModule: true,
    default: { ...actualAxios.default, create: jest.fn<AxiosInstance, []>(() => mockAxiosClient) },
  };
});

describe('BankingService', () => {
  let service: BankingService;
  const httpService = mockDeep<HttpService>();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankingService, { provide: HttpService, useValue: httpService }],
    }).compile();

    service = module.get<BankingService>(BankingService);
  });

  it('consulta alias en Bica y devuelve CBU', async () => {
    httpService.get.mockReturnValue(of(axiosResponse({ cbu: '000123' })));
    await expect(service.getCBUFromAlias('ada.alias')).resolves.toBe('000123');
    const [url, options] = httpService.get.mock.calls[0];
    expect(url).toBe('https://plazofijo.bancobica.com.ar/svc/api/coelsa/alias-a-cbu');
    expect(options?.params).toEqual({ alias: 'ada.alias' });
    expect(options?.headers).toMatchObject({ Accept: 'application/json, text/plain, */*' });
  });

  it('devuelve cadena vacía ante error de Bica', async () => {
    httpService.get.mockReturnValue(throwError(() => new Error('request timeout')));
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
    await expect(service.getCBUFromAlias('missing.alias')).resolves.toBe('');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('request timeout'));
    log.mockRestore();
  });

  it('convierte errores de Bica que no son instancias Error a texto', async () => {
    httpService.get.mockReturnValue(throwError(() => 'Bica unavailable'));
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
    await expect(service.getCBUFromAlias('missing.alias')).resolves.toBe('');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Bica unavailable'));
    log.mockRestore();
  });

  it('inicializa cliente Buho con cookie jar y hace warm-up antes de verificar CBU', async () => {
    mockAxiosClient.get
      .mockResolvedValueOnce(axiosResponse('home'))
      .mockResolvedValueOnce(axiosResponse({ titular: 'Ada' }));
    const axiosCreate = jest.spyOn(axios, 'create');
    service.onModuleInit();

    await expect(service.getCuentaFromCBU('000123')).resolves.toEqual({ titular: 'Ada' });
    const createCall = axiosCreate.mock.calls[0];
    if (!createCall) throw new Error('Se esperaba la inicialización del cliente Axios');
    const options = createCall[0];
    if (!options) throw new Error('Se esperaba la configuración del cliente Axios');
    expect(options.baseURL).toBe('https://buhobank.com');
    expect(options.withCredentials).toBe(true);
    expect(options.jar).toBeDefined();
    expect(wrapper).toHaveBeenCalledWith(mockAxiosClient);
    expect(axiosGet.mock.calls[0][0]).toBe('/');
    expect(axiosGet.mock.calls[0][1]?.headers).toHaveProperty(
      'Accept',
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    );
    expect(axiosGet.mock.calls[1][0]).toBe('/api/plazoFijo/verificarCBU');
    expect(axiosGet.mock.calls[1][1]?.params).toEqual({ cbu: '000123' });
    expect(axiosGet.mock.calls[1][1]?.headers).toHaveProperty('User-Agent');
  });

  it('omite el warm-up cuando el cookie jar ya contiene una cookie de sesión TS', async () => {
    mockAxiosClient.get.mockResolvedValueOnce(axiosResponse({ titular: 'Ada' }));
    service.onModuleInit();
    service['jar'].setCookieSync('TSsession=active; Path=/onboarding', 'https://buhobank.com/onboarding');

    await expect(service.getCuentaFromCBU('000456')).resolves.toEqual({ titular: 'Ada' });
    expect(axiosGet).toHaveBeenCalledTimes(1);
    expect(axiosGet.mock.calls[0][0]).toBe('/api/plazoFijo/verificarCBU');
    expect(axiosGet.mock.calls[0][1]?.params).toEqual({ cbu: '000456' });
    expect(axiosGet.mock.calls[0][1]?.headers).toHaveProperty('User-Agent');
  });

  it('detiene verificación si falla warm-up y devuelve undefined', async () => {
    mockAxiosClient.get.mockRejectedValueOnce(new Error('warm-up failed'));
    service.onModuleInit();
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    await expect(service.getCuentaFromCBU('000123')).resolves.toBeUndefined();
    expect(axiosGet).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('warm-up failed'));
    log.mockRestore();
  });

  it('devuelve undefined cuando falla la API Buho luego del warm-up', async () => {
    mockAxiosClient.get.mockResolvedValueOnce(axiosResponse('home')).mockRejectedValueOnce(new Error('CBU timeout'));
    service.onModuleInit();
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    await expect(service.getCuentaFromCBU('000123')).resolves.toBeUndefined();
    expect(axiosGet).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('CBU timeout'));
    log.mockRestore();
  });

  it('convierte errores de Buho que no son instancias Error a texto', async () => {
    mockAxiosClient.get.mockResolvedValueOnce(axiosResponse('home')).mockRejectedValueOnce('Buho unavailable');
    service.onModuleInit();
    const log = jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    await expect(service.getCuentaFromCBU('000123')).resolves.toBeUndefined();
    expect(axiosGet).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Buho unavailable'));
    log.mockRestore();
  });
});
