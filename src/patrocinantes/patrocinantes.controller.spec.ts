import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PatrocinantesController } from './patrocinantes.controller';
import { PatrocinantesService } from './patrocinantes.service';

describe('PatrocinantesController', () => {
  let controller: PatrocinantesController;
  const service = {
    isUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    getTotalCount: jest.fn(),
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
    const dto = { nombre: 'Abogada', nroMatricula: 123 } as any;

    await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('rechaza crear si la matrícula ya está ocupada', async () => {
    service.isUnique.mockResolvedValue(false);
    await expect(controller.create({ nroMatricula: 123 } as any)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.create).not.toHaveBeenCalled();
  });

  it('actualiza cuando la matrícula sigue siendo única', async () => {
    service.isUnique.mockResolvedValue(true);
    service.update.mockResolvedValue({ id: 1 });
    await expect(controller.update(1, { nroMatricula: 123 } as any)).resolves.toEqual({ id: 1 });
    expect(service.isUnique).toHaveBeenCalledWith({ id: 1, nroMatricula: 123 });
  });

  it('rechaza actualizar con una matrícula duplicada', async () => {
    service.isUnique.mockResolvedValue(false);
    await expect(controller.update(1, { nroMatricula: 456 } as any)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.update).not.toHaveBeenCalled();
  });

  it('combina total y resultados paginados en el listado', async () => {
    service.getTotalCount.mockResolvedValue(5);
    service.findAll.mockResolvedValue([{ id: 1 }]);
    await expect(controller.findAll('Ada', 2, 10)).resolves.toMatchObject({ totalRecords: 5, data: [{ id: 1 }] });
    expect(service.findAll).toHaveBeenCalledWith('Ada', 2, 10);
  });

  it('aplica parámetros null por defecto al listado', async () => {
    service.getTotalCount.mockResolvedValue(0);
    service.findAll.mockResolvedValue([]);
    await controller.findAll(undefined, undefined, undefined);
    expect(service.findAll).toHaveBeenCalledWith(null, null, null);
  });
});
