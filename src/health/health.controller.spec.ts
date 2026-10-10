import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { QStashGuard } from 'src/auth/qstash.guard';
import { PrismaService } from 'src/shared/services/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  const prisma = { $queryRaw: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    })
      .overrideGuard(QStashGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('informa que la aplicación está disponible sin consultar la base', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('comprueba la conexión antes de informar estado de servicios', async () => {
    await expect(controller.services()).resolves.toEqual({ status: 'ok', db: 'connected' });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('despierta la instancia y comprueba la conexión', async () => {
    await expect(controller.start({})).resolves.toEqual({ status: 'ok', db: 'connected' });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
