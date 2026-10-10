import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CorsOptions, CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import { appConfig, databaseConfig } from './config';
import { AppService } from './app.service';
import fs from 'node:fs';
import helmet from 'helmet';

jest.mock('./config', () => ({
  appConfig: jest.fn(),
  databaseConfig: jest.fn(),
}));
jest.mock('node:fs', () => ({ writeFileSync: jest.fn() }));
jest.mock('helmet', () => jest.fn(() => (_request: unknown, _response: unknown, next: () => void) => next()));

function hasCorsOrigin(value: unknown): value is CorsOptions & { origin: CustomOrigin } {
  return typeof value === 'object' && value !== null && 'origin' in value && typeof value.origin === 'function';
}

describe('AppService', () => {
  let service: AppService;
  let testingModule: TestingModule;
  let app: NestExpressApplication;
  const appConfigMock = jest.mocked(appConfig);
  const databaseConfigMock = jest.mocked(databaseConfig);
  const logger = new Logger('AppServiceSpec');

  beforeEach(async () => {
    jest.clearAllMocks();
    testingModule = await Test.createTestingModule({}).compile();
    app = testingModule.createNestApplication<NestExpressApplication>();
    jest.spyOn(SwaggerModule, 'createDocument').mockReturnValue({ ...new DocumentBuilder().build(), paths: {} });
    jest.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined);
    service = new AppService();
    appConfigMock.mockReturnValue({
      nodeEnv: 'test',
      frontendUrl: 'https://frontend.example.test',
      allowedOrigins: ['https://allowed.test'],
    });
    databaseConfigMock.mockReturnValue({
      dbUrl: 'mysql://user:pass@database.test/app',
      dbCertPath: '/tmp/certs',
      dbCertName: 'ca.pem',
      dbCertificate: undefined,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('expone opciones Nest con raw body y logger configurado', () => {
    const options = service.configureOptions();
    expect(options.rawBody).toBe(true);
    expect(options.logger).toBeDefined();
  });

  it('formatea contextos de log string/número, objeto y ausentes', () => {
    expect(service['getContext']('Auth')).toBe('[Auth] ');
    expect(service['getContext'](12)).toBe('[12] ');
    expect(service['getContext']({ requestId: 'r1' })).toBe('[{"requestId":"r1"}] ');
    expect(service['getContext'](null)).toBe('');
    expect(service['getContext'](undefined)).toBe('');
  });

  it('configura Swagger con esquema bearer/cookie en la raíz', () => {
    const createDocument = jest.spyOn(SwaggerModule, 'createDocument');
    const setupSwagger = jest.spyOn(SwaggerModule, 'setup');
    service.configureSwagger(app);
    expect(createDocument).toHaveBeenCalledWith(app, expect.any(Object));
    expect(setupSwagger).toHaveBeenCalledWith('/', app, expect.any(Object));
    expect(DocumentBuilder).toBeDefined();
  });

  it('escribe certificado CA solo cuando existe y exporta su ruta para Node', () => {
    databaseConfigMock.mockReturnValue({
      dbUrl: 'mysql://user:pass@database.test/app',
      dbCertPath: '/tmp/certs',
      dbCertName: 'ca.pem',
      dbCertificate: '-----BEGIN CERTIFICATE-----',
    });
    service.loadDBCertificate();
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/certs/ca.pem', '-----BEGIN CERTIFICATE-----');
    expect(process.env.NODE_EXTRA_CA_CERTS).toBe('/tmp/certs/ca.pem');

    jest.clearAllMocks();
    databaseConfigMock.mockReturnValue({
      dbUrl: 'mysql://user:pass@database.test/app',
      dbCertPath: '/tmp/certs',
      dbCertName: 'ca.pem',
      dbCertificate: '',
    });
    service.loadDBCertificate();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('configura CORS para origen ausente, allowlist, frontend y rechazo', () => {
    const enableCors = jest.spyOn(app, 'enableCors');
    service.enableCors(app, logger);
    const options = enableCors.mock.calls[0][0];
    if (!hasCorsOrigin(options)) throw new Error('Se esperaba una configuración CORS con callback de origen');
    expect(options).toMatchObject({ methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });

    const allowed = jest.fn<void, [Error | null, boolean?]>();
    options.origin(undefined, allowed);
    expect(allowed).toHaveBeenCalledWith(null, true);
    options.origin('https://allowed.test', allowed);
    expect(allowed).toHaveBeenLastCalledWith(null, true);
    options.origin('https://frontend.example.test', allowed);
    expect(allowed).toHaveBeenLastCalledWith(null, true);
    options.origin('https://evil.test', allowed);
    expect(allowed).toHaveBeenLastCalledWith(expect.any(Error), false);
  });

  it('usa allowlist regex y configura trust proxy junto con Helmet', () => {
    appConfigMock.mockReturnValue({
      nodeEnv: 'test',
      frontendUrl: 'https://frontend.example.test',
      allowedOrigins: /^https:\/\/.*\.test$/,
    });
    const enableCors = jest.spyOn(app, 'enableCors');
    service.enableCors(app, logger);
    const options = enableCors.mock.calls[0][0];
    if (!hasCorsOrigin(options)) throw new Error('Se esperaba una configuración CORS con callback de origen');
    const callback = jest.fn<void, [Error | null, boolean?]>();
    options.origin('https://app.test', callback);
    expect(callback).toHaveBeenCalledWith(null, true);

    const set = jest.spyOn(app, 'set');
    const use = jest.spyOn(app, 'use');
    service.enableTrustProxy(app, logger);
    expect(set).toHaveBeenCalledWith('trust proxy', 1);
    expect(typeof use.mock.calls[0][0]).toBe('function');
    expect(helmet).toHaveBeenCalledTimes(1);
  });
});
