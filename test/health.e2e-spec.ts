import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HealthController } from '../src/health/health.controller';
import { QStashGuard } from '../src/auth/qstash.guard';
import { PrismaService } from '../src/shared/services/prisma.service';
import { RequestListener } from 'node:http';

function isRequestListener(value: unknown): value is RequestListener {
  return typeof value === 'function';
}

describe('Health HTTP (e2e)', () => {
  let app: INestApplication;
  let requestHandler: RequestListener;
  const queryRaw = jest.fn<Promise<unknown>, [TemplateStringsArray, ...unknown[]]>().mockResolvedValue([{ value: 1 }]);
  const prisma = { $queryRaw: queryRaw };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    })
      .overrideGuard(QStashGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
    const adapterInstance: unknown = app.getHttpAdapter().getInstance();
    if (!isRequestListener(adapterInstance)) throw new Error('Nest no creó un handler HTTP');
    requestHandler = adapterInstance;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('responde GET /health sin consultar Prisma', async () => {
    await request(requestHandler).get('/health').expect(200).expect({ status: 'ok' });
    expect(queryRaw.mock.calls).toHaveLength(0);
  });

  it('responde GET /health/services tras consulta mockeada', async () => {
    await request(requestHandler).get('/health/services').expect(200).expect({ status: 'ok', db: 'connected' });
    expect(queryRaw.mock.calls).toHaveLength(1);
  });

  it('responde POST /health una vez autorizado por el guard sustituido', async () => {
    await request(requestHandler)
      .post('/health')
      .send({ wake: true })
      .expect(201)
      .expect({ status: 'ok', db: 'connected' });
    expect(queryRaw.mock.calls).toHaveLength(1);
  });
});
