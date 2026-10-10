import { Test, TestingModule } from '@nestjs/testing';
import { TipdocsController } from './tipdocs.controller';
import { TipdocsService } from './tipdocs.service';
import { BadRequestException } from '@nestjs/common';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';

describe('TipdocsController', () => {
  let controller: TipdocsController;
  const service = {
    isUnique: jest.fn<Promise<boolean>, [{ id?: number; sintetico?: string }]>(),
    create: jest.fn<Promise<{ id: number }>, [CreateTipdocDto]>(),
    update: jest.fn<Promise<{ id: number }>, [number, CreateTipdocDto]>(),
    findAll: jest.fn<Promise<{ id: number }[]>, []>(),
    findAllPaginated: jest.fn<Promise<{ id: number }[]>, [number, number]>(),
    getTotalCount: jest.fn<Promise<number>, []>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipdocsController],
      providers: [{ provide: TipdocsService, useValue: service }],
    }).compile();

    controller = module.get<TipdocsController>(TipdocsController);
  });

  it('crea cuando el sintético está libre y rechaza un duplicado', async () => {
    service.isUnique.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    service.create.mockResolvedValue({ id: 1 });
    const dto = Object.assign(new CreateTipdocDto(), { sintetico: 'DNI', descripcion: 'Documento' });

    await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
    await expect(controller.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.create.mock.calls).toHaveLength(1);
  });

  it('actualiza un sintético libre y rechaza un duplicado', async () => {
    service.isUnique.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    service.update.mockResolvedValue({ id: 1 });
    const dto = Object.assign(new CreateTipdocDto(), { sintetico: 'DNI', descripcion: 'Documento' });

    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1 });
    await expect(controller.update(1, dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(service.update.mock.calls).toHaveLength(1);
  });

  it('lista todos cuando faltan parámetros y usa paginación cuando están presentes', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    service.getTotalCount.mockResolvedValue(9);
    service.findAllPaginated.mockResolvedValue([{ id: 3 }]);

    await expect(controller.findAll(null, null)).resolves.toMatchObject({
      totalRecords: 2,
      data: [{ id: 1 }, { id: 2 }],
    });
    await expect(controller.findAll(2, 4)).resolves.toMatchObject({ totalRecords: 9, data: [{ id: 3 }] });
    expect(service.findAllPaginated.mock.calls).toContainEqual([2, 4]);
  });
});
