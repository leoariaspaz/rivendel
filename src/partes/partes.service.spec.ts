import { Test, TestingModule } from '@nestjs/testing';
import { PartesService } from './partes.service';
import { PrismaService } from 'src/shared/services/prisma.service';

describe('PartesService', () => {
  let service: PartesService;
  const prisma = {
    parte: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PartesService>(PartesService);
  });

  it('crea partes asignándolas al usuario y normaliza datos opcionales', async () => {
    prisma.parte.create.mockResolvedValue({ id: 9 });
    const dto = { nombre: 'Ada', idTipoDocumento: 1, nroDocumento: '123', esApoderado: false } as any;

    await expect(service.create(22, dto)).resolves.toEqual({ id: 9 });
    expect(prisma.parte.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ idUsuario: 22, cuil: '', idPatrocinante: null, nombre: 'Ada' }),
    });
  });

  it('conserva CUIL y patrocinante explícitos al crear y actualizar', async () => {
    await service.create(22, {
      nombre: 'Ada',
      idTipoDocumento: 1,
      nroDocumento: '123',
      cuil: '20-123',
      idPatrocinante: 7,
      esApoderado: false,
    } as any);
    await service.update(22, 9, { idTipoDocumento: '2', idPatrocinante: 7 } as any);
    expect(prisma.parte.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ cuil: '20-123', idPatrocinante: 7 }),
    });
    expect(prisma.parte.update).toHaveBeenCalledWith({
      where: { idUsuario: 22, id: 9 },
      data: expect.objectContaining({ idTipoDocumento: 2, idPatrocinante: 7 }),
    });
  });

  it('lee solo una parte del usuario indicado y mapea nulls y patrocinante', async () => {
    prisma.parte.findUnique.mockResolvedValue({
      id: 9,
      nroDocumento: '123',
      cuil: null,
      nombre: 'Ada',
      domicilio: null,
      localidad: null,
      idTipoDocumento: 1,
      tipoDocumento: { sintetico: 'DNI' },
      idPatrocinante: 7,
      patrocinante: { nombre: 'Abogada', nroMatricula: 77, domicilio: 'Calle 1', localidad: 'Centro' },
      esApoderado: true,
    });

    await expect(service.findOne(22, 9)).resolves.toMatchObject({
      id: 9,
      domicilio: '',
      localidad: '',
      tipoDocumento: 'DNI',
      patrocinante: { id: 7, nombre: 'Abogada' },
    });
    expect(prisma.parte.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 9, idUsuario: 22 } })
    );
  });

  it('devuelve null si la parte no pertenece al usuario o no existe', async () => {
    prisma.parte.findUnique.mockResolvedValue(null);
    await expect(service.findOne(22, 9)).resolves.toBeNull();
  });

  it('mapea parte sin patrocinante y permite campos domicilio/localidad ya definidos', async () => {
    prisma.parte.findUnique.mockResolvedValue({
      id: 9,
      nroDocumento: '123',
      cuil: '20-123',
      nombre: 'Ada',
      domicilio: 'Calle',
      localidad: 'Ciudad',
      idTipoDocumento: 1,
      tipoDocumento: { sintetico: 'DNI' },
      idPatrocinante: null,
      patrocinante: null,
      esApoderado: false,
    });
    await expect(service.findOne(22, 9)).resolves.toMatchObject({ domicilio: 'Calle', localidad: 'Ciudad' });
    expect((await service.findOne(22, 9) as any).patrocinante).toBeUndefined();
  });

  it('acota actualizar y eliminar al usuario dueño', async () => {
    await service.update(22, 9, { nombre: 'Ada nueva', idTipoDocumento: '2', nroDocumento: '456' } as any);
    await service.remove(22, 9);

    expect(prisma.parte.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 9, idUsuario: 22 }, data: expect.objectContaining({ nombre: 'Ada nueva' }) })
    );
    expect(prisma.parte.delete).toHaveBeenCalledWith({ where: { id: 9, idUsuario: 22 } });
  });

  it('filtra y pagina listados manteniendo el alcance por usuario', async () => {
    prisma.parte.findMany.mockResolvedValue([]);
    prisma.parte.count.mockResolvedValue(0);

    await expect(service.findAll(22, 'Ada', 3, 10)).resolves.toEqual([]);
    expect(prisma.parte.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idUsuario: 22, OR: [{ nombre: { contains: 'Ada' } }, { cuil: { contains: 'Ada' } }] },
        skip: 20,
        take: 10,
      })
    );
    await service.getTotalCount(22, null);
    expect(prisma.parte.count).toHaveBeenCalledWith({ where: { idUsuario: 22 } });
  });

  it('valida existencia y relaciones sin asumir que una parte faltante tiene reclamos', async () => {
    prisma.parte.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    prisma.parte.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ reclamos: [{ id: 2 }] });

    await expect(service.exists(9)).resolves.toEqual({ isValid: false, message: 'No existe la parte.' });
    await expect(service.exists(10)).resolves.toEqual({ isValid: true, message: '' });
    await expect(service.isRelated(9)).resolves.toEqual({ hasRelations: false, message: '' });
    await expect(service.isRelated(10)).resolves.toEqual({ hasRelations: true, message: 'Hay reclamos relacionados.' });
  });
});
