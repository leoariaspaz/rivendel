import { Test, TestingModule } from '@nestjs/testing';
import { TipdocsService } from './tipdocs.service';
import { PrismaService } from 'src/shared/services/prisma.service';

describe('TipdocsService', () => {
  let service: TipdocsService;
  const prisma = {
    tipoDocumento: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
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
    await expect(service.create({ sintetico: 'DNI', descripcion: 'Documento' } as any)).resolves.toEqual({ id: 1 });
    await service.findOne(1);
    await service.update(1, { sintetico: 'LC', descripcion: 'Libreta' } as any);

    expect(prisma.tipoDocumento.create).toHaveBeenCalledWith({ data: { sintetico: 'DNI', descripcion: 'Documento' } });
    expect(prisma.tipoDocumento.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.tipoDocumento.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { sintetico: 'LC', descripcion: 'Libreta' },
    });
  });

  it('lista en orden y calcula páginas con skip/take', async () => {
    await service.findAll();
    await service.findAllPaginated(3, 10);

    expect(prisma.tipoDocumento.findMany).toHaveBeenNthCalledWith(1, { orderBy: { sintetico: 'asc' } });
    expect(prisma.tipoDocumento.findMany).toHaveBeenNthCalledWith(2, {
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

    expect(prisma.tipoDocumento.count).toHaveBeenNthCalledWith(1);
    expect(prisma.tipoDocumento.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('comprueba unicidad excluyendo el id actual al editar', async () => {
    prisma.tipoDocumento.count.mockResolvedValue(0);
    await expect(service.isUnique({ id: 1, sintetico: 'DNI' })).resolves.toBe(true);
    expect(prisma.tipoDocumento.count).toHaveBeenCalledWith({ where: { sintetico: 'DNI', id: { not: 1 } } });
  });
});
