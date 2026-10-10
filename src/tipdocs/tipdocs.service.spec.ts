import { Test, TestingModule } from '@nestjs/testing';
import { TipdocsService } from './tipdocs.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';

describe('TipdocsService', () => {
  let service: TipdocsService;
  const prisma = {
    tipoDocumento: {
      create: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      findMany: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      findUnique: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      update: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      delete: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      count: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      findFirst: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipdocsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TipdocsService>(TipdocsService);
  });

  it('crea, lee y actualiza un tipo de documento', async () => {
    prisma.tipoDocumento.create.mockResolvedValue({ id: 1 });
    await expect(
      service.create(Object.assign(new CreateTipdocDto(), { sintetico: 'DNI', descripcion: 'Documento' }))
    ).resolves.toEqual({ id: 1 });
    await service.findOne(1);
    await service.update(1, { sintetico: 'LC', descripcion: 'Libreta' });

    expect(prisma.tipoDocumento.create.mock.calls[0][0]).toEqual({
      data: { sintetico: 'DNI', descripcion: 'Documento' },
    });
    expect(prisma.tipoDocumento.findUnique.mock.calls[0][0]).toEqual({ where: { id: 1 } });
    expect(prisma.tipoDocumento.update.mock.calls[0][0]).toEqual({
      where: { id: 1 },
      data: { sintetico: 'LC', descripcion: 'Libreta' },
    });
  });

  it('lista en orden y calcula páginas con skip/take', async () => {
    await service.findAll();
    await service.findAllPaginated(3, 10);

    expect(prisma.tipoDocumento.findMany.mock.calls[0][0]).toEqual({ orderBy: { sintetico: 'asc' } });
    expect(prisma.tipoDocumento.findMany.mock.calls[1][0]).toEqual({
      skip: 20,
      take: 10,
      orderBy: { sintetico: 'asc' },
    });
  });

  it('cuenta, elimina y verifica existencia y relaciones', async () => {
    prisma.tipoDocumento.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    prisma.tipoDocumento.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ partes: [{ id: 3 }] });

    await service.getTotalCount();
    await service.remove(1);
    await expect(service.exists(1)).resolves.toEqual({ isValid: true, message: '' });
    await expect(service.exists(2)).resolves.toEqual({ isValid: false, message: 'No existe el tipo de documento.' });
    await expect(service.isRelated(1)).resolves.toEqual({ hasRelations: false, message: '' });
    await expect(service.isRelated(2)).resolves.toEqual({ hasRelations: true, message: 'Hay partes relacionadas.' });

    expect(prisma.tipoDocumento.count.mock.calls[0]).toHaveLength(0);
    expect(prisma.tipoDocumento.delete.mock.calls[0][0]).toEqual({ where: { id: 1 } });
  });

  it('comprueba unicidad excluyendo el id actual al editar', async () => {
    prisma.tipoDocumento.count.mockResolvedValue(0);
    await expect(service.isUnique({ id: 1, sintetico: 'DNI' })).resolves.toBe(true);
    expect(prisma.tipoDocumento.count.mock.calls[0][0]).toEqual({ where: { sintetico: 'DNI', id: { not: 1 } } });
  });
});
