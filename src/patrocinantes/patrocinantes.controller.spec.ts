import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PatrocinantesController } from './patrocinantes.controller';
import { PatrocinantesService } from './patrocinantes.service';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';

describe('PatrocinantesController', () => {
  let controller: PatrocinantesController;
  const service = {
    isUnique: jest.fn<Promise<boolean>, [{ id?: number; nroMatricula?: number }]>(),
    create: jest.fn<Promise<{ id: number }>, [CreatePatrocinanteDto]>(),
    update: jest.fn<Promise<{ id: number }>, [number, UpdatePatrocinanteDto]>(),
    findAll: jest.fn<Promise<{ id: number }[]>, [string | null, number | null, number | null]>(),
    getTotalCount: jest.fn<Promise<number>, [string | null]>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatrocinantesController],
      providers: [{ provide: PatrocinantesService, useValue: service }],
    }).compile();

    controller = module.get<PatrocinantesController>(PatrocinantesController);
  });

  it('crea cuando la matrícula está libre', async () => {
    service.isUnique.mockResolvedValue(true);
    service.create.mockResolvedValue({ id: 1 });
    const dto = Object.assign(new CreatePatrocinanteDto(), { nombre: 'Abogada', nroMatricula: 123 });

    await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
    expect(service.create.mock.calls).toContainEqual([dto]);
  });

  it('rechaza crear si la matrícula ya está ocupada', async () => {
    service.isUnique.mockResolvedValue(false);
    await expect(
      controller.create(Object.assign(new CreatePatrocinanteDto(), { nroMatricula: 123 }))
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.create.mock.calls).toHaveLength(0);
  });

  it('actualiza cuando la matrícula sigue siendo única', async () => {
    service.isUnique.mockResolvedValue(true);
    service.update.mockResolvedValue({ id: 1 });
    await expect(
      controller.update(1, Object.assign(new UpdatePatrocinanteDto(), { nroMatricula: 123 }))
    ).resolves.toEqual({ id: 1 });
    expect(service.isUnique.mock.calls).toContainEqual([{ id: 1, nroMatricula: 123 }]);
  });

  it('rechaza actualizar con una matrícula duplicada', async () => {
    service.isUnique.mockResolvedValue(false);
    await expect(
      controller.update(1, Object.assign(new UpdatePatrocinanteDto(), { nroMatricula: 456 }))
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.update.mock.calls).toHaveLength(0);
  });

  it('combina total y resultados paginados en el listado', async () => {
    service.getTotalCount.mockResolvedValue(5);
    service.findAll.mockResolvedValue([{ id: 1 }]);
    await expect(controller.findAll('Ada', 2, 10)).resolves.toMatchObject({ totalRecords: 5, data: [{ id: 1 }] });
    expect(service.findAll.mock.calls).toContainEqual(['Ada', 2, 10]);
  });

  it('aplica parámetros null por defecto al listado', async () => {
    service.getTotalCount.mockResolvedValue(0);
    service.findAll.mockResolvedValue([]);
    await controller.findAll(undefined, undefined, undefined);
    expect(service.findAll.mock.calls).toContainEqual([null, null, null]);
  });
});
