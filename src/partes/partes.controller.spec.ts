import { Test, TestingModule } from '@nestjs/testing';
import { PartesController } from './partes.controller';
import { PartesService } from './partes.service';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';

describe('PartesController', () => {
  let controller: PartesController;
  const service = {
    create: jest.fn<Promise<{ id: number }>, [number, CreateParteDto]>(),
    findOne: jest.fn<Promise<{ id: number } | null>, [number, number]>(),
    update: jest.fn<Promise<{ id: number }>, [number, number, UpdateParteDto]>(),
    remove: jest.fn<Promise<void>, [number, number]>(),
    findAll: jest.fn<Promise<{ id: number }[]>, [number, string | null, number | null, number | null]>(),
    getTotalCount: jest.fn<Promise<number>, [number, string | null]>(),
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
    const dto = Object.assign(new CreateParteDto(), {
      nombre: 'Ada',
      idTipoDocumento: 1,
      nroDocumento: '123',
      esApoderado: false,
    });
    await controller.create(7, dto);
    await controller.findOne(7, 1);
    await controller.update(7, 1, { nombre: 'Ada nueva' });
    await controller.remove(7, 1);

    expect(service.create.mock.calls).toContainEqual([7, dto]);
    expect(service.findOne.mock.calls).toContainEqual([7, 1]);
    expect(service.update.mock.calls).toContainEqual([7, 1, { nombre: 'Ada nueva' }]);
    expect(service.remove.mock.calls).toContainEqual([7, 1]);
  });

  it('devuelve listado y total de registros con filtro y paginación', async () => {
    service.findAll.mockResolvedValue([{ id: 1 }]);
    service.getTotalCount.mockResolvedValue(12);
    await expect(controller.findAll(7, 'Ada', 2, 5)).resolves.toMatchObject({ totalRecords: 12, data: [{ id: 1 }] });
    expect(service.findAll.mock.calls).toContainEqual([7, 'Ada', 2, 5]);
  });

  it('usa defaults del endpoint cuando se omiten búsqueda y paginación', async () => {
    service.findAll.mockResolvedValue([]);
    service.getTotalCount.mockResolvedValue(0);
    await controller.findAll(7, undefined, undefined, undefined);
    expect(service.findAll.mock.calls).toContainEqual([7, null, null, null]);
    expect(service.getTotalCount.mock.calls).toContainEqual([7, null]);
  });
});
