import { Test, TestingModule } from '@nestjs/testing';
import { PatrocinantesService } from './patrocinantes.service';
import { PrismaService } from 'src/shared/services/prisma.service';

describe('PatrocinantesService', () => {
  let service: PatrocinantesService;
  const prisma = {
    patrocinante: {
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
      providers: [PatrocinantesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PatrocinantesService>(PatrocinantesService);
  });

  it('crea y actualiza normalizando campos numéricos', async () => {
    prisma.patrocinante.create.mockResolvedValue({ id: 5 });
    await service.create({ nombre: 'Abogada', nroMatricula: '123', nroCasillero: '8' } as any);
    await service.update(5, { nombre: 'Abogada', nroMatricula: '124', nroCasillero: '9' } as any);

    expect(prisma.patrocinante.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ nroMatricula: 123, nroCasillero: 8 }),
    });
    expect(prisma.patrocinante.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: expect.objectContaining({ nroMatricula: 124, nroCasillero: 9 }),
    });
  });

  it('pagina y filtra por nombre, matrícula y casillero', async () => {
    prisma.patrocinante.findMany.mockResolvedValue([]);
    await service.findAll('123', 2, 10);

    expect(prisma.patrocinante.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nombre: { contains: '123' } },
          { nroMatricula: { equals: 123 } },
          { nroCasillero: { equals: 123 } },
        ],
      },
      skip: 10,
      take: 10,
      orderBy: { nombre: 'asc' },
    });
  });

  it('filtra texto no numérico sin fabricar criterios de igualdad numérica', async () => {
    await service.findAll('Ada', 1, 5);
    expect(prisma.patrocinante.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nombre: { contains: 'Ada' } },
          { nroMatricula: { equals: undefined } },
          { nroCasillero: { equals: undefined } },
        ],
      },
      skip: 0,
      take: 5,
      orderBy: { nombre: 'asc' },
    });
  });

  it('omite where y paginación para un listado general', async () => {
    await service.findAll(null, null, null);
    expect(prisma.patrocinante.findMany).toHaveBeenCalledWith({
      where: {},
      skip: undefined,
      take: undefined,
      orderBy: { nombre: 'asc' },
    });
  });

  it('consulta, actualiza y elimina por id', async () => {
    await service.findOne(5);
    await service.remove(5);
    expect(prisma.patrocinante.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(prisma.patrocinante.delete).toHaveBeenCalledWith({ where: { id: 5 } });
  });

  it('cuenta con filtros numéricos y texto', async () => {
    await service.getTotalCount('Abogada');
    expect(prisma.patrocinante.count).toHaveBeenCalledWith({
      where: {
        OR: [
          { nombre: { contains: 'Abogada' } },
          { nroMatricula: { equals: undefined } },
          { nroCasillero: { equals: undefined } },
        ],
      },
    });
    await service.getTotalCount(null);
    expect(prisma.patrocinante.count).toHaveBeenLastCalledWith({ where: {} });
  });

  it('valida presencia, matrícula única y relaciones', async () => {
    prisma.patrocinante.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    prisma.patrocinante.findFirst.mockResolvedValueOnce({ nroMatricula: 123 }).mockResolvedValueOnce({ partes: [{} ] }).mockResolvedValueOnce(null);

    await expect(service.exists(0)).resolves.toEqual({ isValid: true, message: undefined });
    await expect(service.exists(5)).resolves.toEqual({ isValid: true, message: '' });
    await expect(service.exists(6)).resolves.toEqual({ isValid: false, message: 'No existe el patrocinante.' });
    await expect(service.existsNroMatricula(123)).resolves.toBe(true);
    await expect(service.isRelated(5)).resolves.toEqual({ hasRelations: true, message: 'Hay partes relacionadas.' });
    await expect(service.isRelated(6)).resolves.toEqual({ hasRelations: false, message: '' });
    await expect(service.isUnique({ nroMatricula: 123 })).resolves.toBe(true);
    expect(prisma.patrocinante.count).toHaveBeenLastCalledWith({ where: { nroMatricula: 123 } });
  });

  it('ignora el mismo registro al comprobar unicidad durante una edición', async () => {
    prisma.patrocinante.count.mockResolvedValue(0);
    await expect(service.isUnique({ id: 5, nroMatricula: 123 })).resolves.toBe(true);
    expect(prisma.patrocinante.count).toHaveBeenCalledWith({ where: { nroMatricula: 123, id: { not: 5 } } });
  });
});
