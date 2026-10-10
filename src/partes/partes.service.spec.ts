import { Test, TestingModule } from '@nestjs/testing';
import { PartesService } from './partes.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';

describe('PartesService', () => {
  let service: PartesService;
  const prisma = {
    parte: {
      create: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      findUnique: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      update: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      delete: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      count: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      findMany: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
      findFirst: jest.fn<Promise<unknown>, [Record<string, unknown>]>(),
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
    const dto = Object.assign(new CreateParteDto(), {
      nombre: 'Ada',
      idTipoDocumento: 1,
      nroDocumento: '123',
      esApoderado: false,
    });

    await expect(service.create(22, dto)).resolves.toEqual({ id: 9 });
    expect(prisma.parte.create.mock.calls[0][0]).toMatchObject({
      data: { idUsuario: 22, cuil: '', idPatrocinante: null, nombre: 'Ada' },
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
    });
    await service.update(22, 9, Object.assign(new UpdateParteDto(), { idTipoDocumento: 2, idPatrocinante: 7 }));
    expect(prisma.parte.create.mock.calls[0][0]).toMatchObject({ data: { cuil: '20-123', idPatrocinante: 7 } });
    expect(prisma.parte.update.mock.calls[0][0]).toMatchObject({
      where: { idUsuario: 22, id: 9 },
      data: { idTipoDocumento: 2, idPatrocinante: 7 },
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
    expect(prisma.parte.findUnique.mock.calls[0][0]).toMatchObject({ where: { id: 9, idUsuario: 22 } });
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
    const parte = await service.findOne(22, 9);
    expect(parte?.patrocinante).toBeUndefined();
  });

  it('acota actualizar y eliminar al usuario dueño', async () => {
    await service.update(
      22,
      9,
      Object.assign(new UpdateParteDto(), { nombre: 'Ada nueva', idTipoDocumento: 2, nroDocumento: '456' })
    );
    await service.remove(22, 9);

    expect(prisma.parte.update.mock.calls[0][0]).toMatchObject({
      where: { id: 9, idUsuario: 22 },
      data: { nombre: 'Ada nueva' },
    });
    expect(prisma.parte.delete.mock.calls[0][0]).toEqual({ where: { id: 9, idUsuario: 22 } });
  });

  it('filtra y pagina listados manteniendo el alcance por usuario', async () => {
    prisma.parte.findMany.mockResolvedValue([]);
    prisma.parte.count.mockResolvedValue(0);

    await expect(service.findAll(22, 'Ada', 3, 10)).resolves.toEqual([]);
    expect(prisma.parte.findMany.mock.calls[0][0]).toMatchObject({
      where: { idUsuario: 22, OR: [{ nombre: { contains: 'Ada' } }, { cuil: { contains: 'Ada' } }] },
      skip: 20,
      take: 10,
    });
    await service.getTotalCount(22, null);
    expect(prisma.parte.count.mock.calls[0][0]).toEqual({ where: { idUsuario: 22 } });
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
