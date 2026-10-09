import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { databaseConfig } from 'src/config';
import { PrismaService } from './prisma.service';

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
jest.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
    constructor(options: unknown) {
      (this as any).options = options;
    }
  },
}));

describe('PrismaService', () => {
  const config = {
    dbUrl: 'mysql://user:pass@database.test:3307/app?sslaccept=strict',
    dbCertPath: '/tmp',
    dbCertificate: '-----BEGIN CERTIFICATE-----secret',
    dbCertName: 'ca.pem',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (PrismaService as any).printed = false;
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('construye PrismaClient con URL configurada y registra contexto de conexión una sola vez', async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService, { provide: databaseConfig.KEY, useValue: config }],
    }).compile();
    const prisma = module.get<PrismaService>(PrismaService);
    expect((prisma as any).options).toEqual({ datasourceUrl: config.dbUrl });
    expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('database app at database.test:3307'));
    expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('SSL: strict'));
    expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('CERT: -----BEGIN CERTIFIC...'));
    await prisma.onModuleInit();
    await prisma.onModuleDestroy();
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('maneja puerto y certificado ausentes al construir el servicio', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: databaseConfig.KEY, useValue: { dbUrl: 'mysql://user:pass@database.test/app' } },
      ],
    }).compile();
    expect(module.get(PrismaService)).toBeInstanceOf(PrismaService);
    expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('database app at database.test:3306'));
    expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('CERT: N/A'));
  });
});
