import { Test, TestingModule } from '@nestjs/testing';
import { ReclamosController } from './reclamos.controller';
import { ReclamosService } from './reclamos.service';
import { BadRequestException } from '@nestjs/common';

describe('ReclamosController', () => {
  let controller: ReclamosController;
  const service = {
    isUnique: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    getTotalCount: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamosController],
      providers: [{ provide: ReclamosService, useValue: service }],
    }).compile();

    controller = module.get<ReclamosController>(ReclamosController);
  });

  it('crea con usuario y permite la combinación fecha/número única', async () => {
    service.isUnique.mockResolvedValue(true);
    service.create.mockResolvedValue({ id: 4 });
    const dto = { numero: 5, fechaHoraInicio: new Date() } as any;
    await expect(controller.create(7, dto)).resolves.toEqual({ id: 4 });
    expect(service.isUnique).toHaveBeenCalledWith({ id: undefined, numero: 5, fecha: dto.fechaHoraInicio });
    expect(service.create).toHaveBeenCalledWith(7, dto);
  });

  it('rechaza reclamos duplicados sin crear', async () => {
    service.isUnique.mockResolvedValue(false);
    await expect(controller.create(7, { numero: 5, fechaHoraInicio: new Date('2026-01-01') } as any)).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(service.create).not.toHaveBeenCalled();
  });

  it('lista para el usuario con paginación y total', async () => {
    service.findAll.mockResolvedValue([{ id: 4 }]);
    service.getTotalCount.mockResolvedValue(12);
    await expect(controller.findAll(7, 'Ada', 2, 5)).resolves.toMatchObject({ totalRecords: 12, data: [{ id: 4 }] });
    expect(service.findAll).toHaveBeenCalledWith(7, 'Ada', 2, 5);
  });

  it('cuenta audiencias al mapear resultado individual', async () => {
    const reclamo = { numero: 5, fechaHoraInicio: new Date(), toFindOneReclamoDTO: jest.fn().mockReturnValue({ id: 4 }) };
    service.findOne.mockResolvedValue(reclamo);
    service.count.mockResolvedValue(3);
    await expect(controller.findOne(7, 4)).resolves.toEqual({ id: 4 });
    expect(reclamo.toFindOneReclamoDTO).toHaveBeenCalledWith(3);
  });

  it('actualiza con excepción de unicidad y remueve usando id numérico', async () => {
    service.isUnique.mockResolvedValue(true);
    service.update.mockResolvedValue({ id: 4 });
    await controller.update(7, 4, { numero: 5 } as any);
    await controller.remove(7, '4');
    expect(service.update).toHaveBeenCalledWith(7, 4, { numero: 5 });
    expect(service.remove).toHaveBeenCalledWith(7, 4);
  });
});
