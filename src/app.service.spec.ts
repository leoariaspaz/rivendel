import { LoggerService } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { appConfig, databaseConfig } from './config';
import { AppService } from './app.service';
import fs from 'node:fs';
import helmet from 'helmet';

jest.mock('./config', () => ({
  appConfig: jest.fn(),
  databaseConfig: jest.fn(),
}));
jest.mock('node:fs', () => ({ writeFileSync: jest.fn() }));
jest.mock('helmet', () => jest.fn(() => 'helmet-middleware'));

describe('AppService', () => {
  let service: AppService;
  const appConfigMock = appConfig as unknown as jest.Mock;
  const databaseConfigMock = databaseConfig as unknown as jest.Mock;
  const logger = { log: jest.fn() } as unknown as LoggerService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(SwaggerModule, 'createDocument').mockReturnValue({} as any);
    jest.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined);
    service = new AppService();
    appConfigMock.mockReturnValue({ frontendUrl: 'https://frontend.example.test', allowedOrigins: ['https://allowed.test'] });
    databaseConfigMock.mockReturnValue({ dbCertPath: '/tmp/certs', dbCertName: 'ca.pem', dbCertificate: undefined });
  });

  it('expone opciones Nest con raw body y logger configurado', () => {
    const options = service.configureOptions();
    expect(options.rawBody).toBe(true);
    expect(options.logger).toBeDefined();
  });

  it('formatea contextos de log string/número, objeto y ausentes', () => {
    expect((service as any).getContext('Auth')).toBe('[Auth] ');
    expect((service as any).getContext(12)).toBe('[12] ');
    expect((service as any).getContext({ requestId: 'r1' })).toBe('[{"requestId":"r1"}] ');
    expect((service as any).getContext(null)).toBe('');
    expect((service as any).getContext(undefined)).toBe('');
  });

  it('configura Swagger con esquema bearer/cookie en la raíz', () => {
    const app = {} as any;
    service.configureSwagger(app);
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, expect.any(Object));
    expect(SwaggerModule.setup).toHaveBeenCalledWith('/', app, expect.any(Object));
    expect(DocumentBuilder).toBeDefined();
  });

  it('escribe certificado CA solo cuando existe y exporta su ruta para Node', () => {
    databaseConfigMock.mockReturnValue({ dbCertPath: '/tmp/certs', dbCertName: 'ca.pem', dbCertificate: '-----BEGIN CERTIFICATE-----' });
    service.loadDBCertificate();
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/certs/ca.pem', '-----BEGIN CERTIFICATE-----');
    expect(process.env.NODE_EXTRA_CA_CERTS).toBe('/tmp/certs/ca.pem');

    jest.clearAllMocks();
    databaseConfigMock.mockReturnValue({ dbCertificate: '' });
    service.loadDBCertificate();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('configura CORS para origen ausente, allowlist, frontend y rechazo', () => {
    const app = { enableCors: jest.fn() } as any;
    service.enableCors(app, logger);
    const options = app.enableCors.mock.calls[0][0];
    expect(options).toMatchObject({ methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });

    const allowed: jest.Mock = jest.fn();
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
    appConfigMock.mockReturnValue({ frontendUrl: 'https://frontend.example.test', allowedOrigins: /^https:\/\/.*\.test$/ });
    const corsApp = { enableCors: jest.fn() } as any;
    service.enableCors(corsApp, logger);
    const callback = jest.fn();
    corsApp.enableCors.mock.calls[0][0].origin('https://app.test', callback);
    expect(callback).toHaveBeenCalledWith(null, true);

    const app = { set: jest.fn(), use: jest.fn() } as any;
    service.enableTrustProxy(app, logger);
    expect(app.set).toHaveBeenCalledWith('trust proxy', 1);
    expect(app.use).toHaveBeenCalledWith('helmet-middleware');
    expect(helmet).toHaveBeenCalledTimes(1);
  });
});
