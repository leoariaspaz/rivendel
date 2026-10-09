import { Test, TestingModule } from '@nestjs/testing';
import { PartesController } from './partes.controller';
import { PartesService } from './partes.service';

describe('PartesController', () => {
  let controller: PartesController;
  const service = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAll: jest.fn(),
    getTotalCount: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartesController],
      providers: [{ provide: PartesService, useValue: service }],
    }).compile();

    controller = module.get<PartesController>(PartesController);
  });

  it('delega alta, consulta, edición y baja con idUsuario explícito', async () => {
    service.create.mockResolvedValue({ id: 1 });
    service.findOne.mockResolvedValue({ id: 1 });
    service.update.mockResolvedValue({ id: 1 });
    await controller.create(7, { nombre: 'Ada' } as any);
    await controller.findOne(7, 1);
    await controller.update(7, 1, { nombre: 'Ada nueva' } as any);
    await controller.remove(7, 1);

    expect(service.create).toHaveBeenCalledWith(7, { nombre: 'Ada' });
    expect(service.findOne).toHaveBeenCalledWith(7, 1);
    expect(service.update).toHaveBeenCalledWith(7, 1, { nombre: 'Ada nueva' });
    expect(service.remove).toHaveBeenCalledWith(7, 1);
  });

  it('devuelve listado y total de registros con filtro y paginación', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }]);
    service.getTotalCount.mockResolvedValue(12);
    await expect(controller.findAll(7, 'Ada', 2, 5)).resolves.toMatchObject({ totalRecords: 12, data: [{ id: 1 }] });
    expect(service.findAll).toHaveBeenCalledWith(7, 'Ada', 2, 5);
  });

  it('usa defaults del endpoint cuando se omiten búsqueda y paginación', async () => {
    service.findAll.mockResolvedValue([]);
    service.getTotalCount.mockResolvedValue(0);
    await controller.findAll(7, undefined, undefined, undefined);
    expect(service.findAll).toHaveBeenCalledWith(7, null, null, null);
    expect(service.getTotalCount).toHaveBeenCalledWith(7, null);
  });
});
