import { Test, TestingModule } from '@nestjs/testing';
import { ReclamosController } from './reclamos.controller';
import { ReclamosService } from './reclamos.service';
import { BadRequestException } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';

describe('ReclamosController', () => {
  let controller: ReclamosController;
  const service = {
    isUnique: jest.fn<Promise<boolean>, [{ id?: number; numero?: number; fecha?: Date }]>(),
    create: jest.fn<Promise<{ id: number }>, [number, CreateReclamoDto]>(),
    findAll: jest.fn<Promise<{ id: number }[]>, [number, string | null, number | null, number | null]>(),
    getTotalCount: jest.fn<Promise<number>, [number, string | null]>(),
    findOne: jest.fn<Promise<unknown>, [number, number]>(),
    count: jest.fn<Promise<number>, [number, number, Date?]>(),
    update: jest.fn<Promise<void>, [number, number, UpdateReclamoDto]>(),
    remove: jest.fn<Promise<void>, [number, number]>(),
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
    const dto = Object.assign(new CreateReclamoDto(), { numero: 5, fechaHoraInicio: new Date() });
    await expect(controller.create(7, dto)).resolves.toEqual({ id: 4 });
    expect(service.isUnique.mock.calls).toContainEqual([{ id: undefined, numero: 5, fecha: dto.fechaHoraInicio }]);
    expect(service.create.mock.calls).toContainEqual([7, dto]);
  });

  it('rechaza reclamos duplicados sin crear', async () => {
    service.isUnique.mockResolvedValue(false);
    await expect(
      controller.create(
        7,
        Object.assign(new CreateReclamoDto(), { numero: 5, fechaHoraInicio: new Date('2026-01-01') })
      )
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.create.mock.calls).toHaveLength(0);
  });

  it('lista para el usuario con paginación y total', async () => {
    service.findAll.mockResolvedValue([{ id: 4 }]);
    service.getTotalCount.mockResolvedValue(12);
    await expect(controller.findAll(7, 'Ada', 2, 5)).resolves.toMatchObject({ totalRecords: 12, data: [{ id: 4 }] });
    expect(service.findAll.mock.calls).toContainEqual([7, 'Ada', 2, 5]);
  });

  it('cuenta audiencias al mapear resultado individual', async () => {
    const reclamo = {
      numero: 5,
      fechaHoraInicio: new Date(),
      toFindOneReclamoDTO: jest.fn().mockReturnValue({ id: 4 }),
    };
    service.findOne.mockResolvedValue(reclamo);
    service.count.mockResolvedValue(3);
    await expect(controller.findOne(7, 4)).resolves.toEqual({ id: 4 });
    expect(reclamo.toFindOneReclamoDTO.mock.calls).toContainEqual([3]);
  });

  it('actualiza con excepción de unicidad y remueve usando id numérico', async () => {
    service.isUnique.mockResolvedValue(true);
    service.update.mockResolvedValue(undefined);
    await controller.update(7, 4, { numero: 5 });
    await controller.remove(7, '4');
    expect(service.update.mock.calls).toContainEqual([7, 4, { numero: 5 }]);
    expect(service.remove.mock.calls).toContainEqual([7, 4]);
  });
});
