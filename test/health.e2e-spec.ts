import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HealthController } from '../src/health/health.controller';
import { QStashGuard } from '../src/auth/qstash.guard';
import { PrismaService } from '../src/shared/services/prisma.service';

describe('Health HTTP (e2e)', () => {
  let app: INestApplication;
  const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ value: 1 }]) };

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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('responde GET /health sin consultar Prisma', async () => {
    await request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('responde GET /health/services tras consulta mockeada', async () => {
    await request(app.getHttpServer()).get('/health/services').expect(200).expect({ status: 'ok', db: 'connected' });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('responde POST /health una vez autorizado por el guard sustituido', async () => {
    await request(app.getHttpServer()).post('/health').send({ wake: true }).expect(201).expect({ status: 'ok', db: 'connected' });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
