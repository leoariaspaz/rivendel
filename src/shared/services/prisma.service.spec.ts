import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { databaseConfig } from 'src/config';
import { PrismaService } from './prisma.service';

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
let prismaClientOptions: unknown;
jest.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
    constructor(options: unknown) {
      prismaClientOptions = options;
    }
  },
}));

describe('PrismaService', () => {
  let loggerLog: jest.SpyInstance;
  const config = {
    dbUrl: 'mysql://user:pass@database.test:3307/app?sslaccept=strict',
    dbCertPath: '/tmp',
    dbCertificate: '-----BEGIN CERTIFICATE-----secret',
    dbCertName: 'ca.pem',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    PrismaService['printed'] = false;
    loggerLog = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('construye PrismaClient con URL configurada y registra contexto de conexión una sola vez', async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService, { provide: databaseConfig.KEY, useValue: config }],
    }).compile();
    const prisma = module.get<PrismaService>(PrismaService);
    expect(prismaClientOptions).toEqual({ datasourceUrl: config.dbUrl });
    expect(loggerLog.mock.calls).toContainEqual([expect.stringContaining('database app at database.test:3307')]);
    expect(loggerLog.mock.calls).toContainEqual([expect.stringContaining('SSL: strict')]);
    expect(loggerLog.mock.calls).toContainEqual([expect.stringContaining('CERT: -----BEGIN CERTIFIC...')]);
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
    expect(loggerLog.mock.calls).toContainEqual([expect.stringContaining('database app at database.test:3306')]);
    expect(loggerLog.mock.calls).toContainEqual([expect.stringContaining('CERT: N/A')]);
  });
});
