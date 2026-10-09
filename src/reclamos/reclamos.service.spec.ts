import { Test, TestingModule } from '@nestjs/testing';
import { ReclamosService } from './reclamos.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PartesService } from 'src/partes/partes.service';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { Prisma } from '@prisma/client';

describe('ReclamosService', () => {
  let service: ReclamosService;
  const prisma = {
    reclamos: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    partesReclamos: { update: jest.fn() },
    $transaction: jest.fn(),
  };
  const partesService = { findOne: jest.fn() };
  const calendar = {
    existsCalendarForUser: jest.fn(),
    createEvent: jest.fn(),
    deleteEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReclamosService,
        { provide: PrismaService, useValue: prisma },
        { provide: PartesService, useValue: partesService },
        { provide: GoogleCalendarService, useValue: calendar },
      ],
    }).compile();

    service = module.get<ReclamosService>(ReclamosService);
  });

  it('crea evento sin partes con ordinal inicial cuando el calendario está conectado', async () => {
    const start = new Date('2026-05-04T10:00:00.000Z');
    calendar.existsCalendarForUser.mockResolvedValue(true);
    prisma.reclamos.count.mockResolvedValue(0);
    calendar.createEvent.mockResolvedValue('event-1');
    await expect(service.createEventInGoogleCalendar(3, 42, start, undefined, [], undefined)).resolves.toBe('event-1');
    expect(calendar.createEvent).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ title: 'Audiencia - Reclamo Nº 42', description: '', end: new Date(start.getTime() + 3600000) })
    );
  });

  it('construye búsqueda siempre acotada al usuario e incorpora filtros numéricos y de fecha', () => {
    expect(service.getWhere(3, null)).toEqual({ idUsuario: 3 });
    expect(service.getWhere(3, '42')).toEqual({
      AND: [
        { idUsuario: 3 },
        {
          OR: [
            { partes: { some: { parte: { nombre: { contains: '42' } } } } },
            { numero: { equals: 42 } },
          ],
        },
      ],
    });
    const dateFilter = service.getWhere(3, '4/5/2026') as any;
    expect(dateFilter.AND[0]).toEqual({ idUsuario: 3 });
    expect(dateFilter.AND[1].OR).toHaveLength(2);
    expect(dateFilter.AND[1].OR[1].fechaHoraInicio.gte.getHours()).toBe(0);
    expect(dateFilter.AND[1].OR[1].fechaHoraInicio.lte.getHours()).toBe(23);
  });

  it('valida cláusulas existentes al leer y al crear un reclamo', async () => {
    const clauses = { type: 'doc', content: [{ type: 'paragraph' }] };
    prisma.reclamos.findUnique.mockResolvedValue({ id: 5, numero: 4, clausulas: clauses, partes: [], usuario: {} });
    await expect(service.findOne(3, 5)).resolves.toMatchObject({ clausulas: clauses });
    calendar.existsCalendarForUser.mockResolvedValue(false);
    prisma.reclamos.create.mockResolvedValue({ id: 5 });
    await service.create(3, { numero: 4, fechaHoraInicio: new Date(), rubros: '', idResolucion: 1, clausulas: clauses } as any);
    expect(prisma.reclamos.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ clausulas: clauses, idUsuario: 3 }),
    });
  });

  it('lista reclamos del usuario con paginación, búsqueda y resolución descriptiva', async () => {
    prisma.reclamos.findMany.mockResolvedValue([{ id: 1, numero: 42, idResolucion: 1 }]);

    await expect(service.findAll(3, '42', 2, 10)).resolves.toEqual([
      expect.objectContaining({ id: 1, numero: 42, resolucion: expect.any(String) }),
    ]);
    expect(prisma.reclamos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: service.getWhere(3, '42'), skip: 10, take: 10 })
    );
  });

  it('recrea evento al cambiar fecha y no crea evento cuando el reclamo no tenía enlace', async () => {
    const oldDate = new Date('2026-05-04T10:00:00.000Z');
    const nextDate = new Date('2026-05-05T10:00:00.000Z');
    prisma.reclamos.findUnique.mockResolvedValueOnce({ id: 5, numero: 42, fechaHoraInicio: oldDate, horaFin: null, googleEventId: 'old', partes: [] });
    prisma.reclamos.update.mockReturnValue(Promise.resolve({ id: 5 }));
    prisma.$transaction.mockResolvedValue([]);
    calendar.existsCalendarForUser.mockResolvedValue(true);
    prisma.reclamos.count.mockResolvedValue(0);
    calendar.createEvent.mockResolvedValue('next-event');
    await service.update(3, 5, { fechaHoraInicio: nextDate } as any);
    expect(calendar.deleteEvent).toHaveBeenCalledWith(3, 'old');

    jest.spyOn(service, 'createEventInGoogleCalendar').mockResolvedValue(null);
    prisma.reclamos.findUnique.mockResolvedValueOnce({ id: 5, numero: 42, fechaHoraInicio: oldDate, horaFin: null, googleEventId: null, partes: [] });
    await service.update(3, 5, { fechaHoraInicio: oldDate } as any);
    expect(service.createEventInGoogleCalendar).toHaveBeenCalledTimes(1);
  });

  it('no elimina un evento si Calendar está desconectado y cuenta sin fecha límite explícita', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({ googleEventId: 'event-5' } as any);
    calendar.existsCalendarForUser.mockResolvedValue(false);
    await service.remove(3, 5);
    expect(calendar.deleteEvent).not.toHaveBeenCalled();
    await service.count(3, 42);
    expect(prisma.reclamos.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ idUsuario: 3, numero: 42, fechaHoraInicio: { lte: expect.any(Date) } }) })
    );
  });

  it('comprueba unicidad por fecha y excluye el id actual cuando se edita', async () => {
    prisma.reclamos.count.mockResolvedValue(0);
    const fecha = new Date('2026-05-04T10:00:00.000Z');
    await expect(service.isUnique({ numero: 42, fecha })).resolves.toBe(true);
    await expect(service.isUnique({ id: 5, numero: 42, fecha })).resolves.toBe(true);
    expect(prisma.reclamos.count).toHaveBeenLastCalledWith({
      where: expect.objectContaining({ numero: 42, id: { not: 5 } }),
    });
  });

  it('busca un reclamo dentro del usuario solicitado y cuenta resultados con el mismo filtro', async () => {
    prisma.reclamos.findUnique.mockResolvedValue({ id: 5, numero: 4, clausulas: null, partes: [], usuario: {} });
    prisma.reclamos.count.mockResolvedValue(2);

    await service.findOne(3, 5);
    await expect(service.getTotalCount(3, null)).resolves.toBe(2);
    expect(prisma.reclamos.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { idUsuario: 3, id: 5 } }));
    expect(prisma.reclamos.count).toHaveBeenCalledWith({ where: { idUsuario: 3 } });
  });

  it('crea un reclamo user-scoped y representa cláusulas nulas con Prisma.JsonNull', async () => {
    calendar.existsCalendarForUser.mockResolvedValue(false);
    prisma.reclamos.create.mockResolvedValue({ id: 5 });
    const fecha = new Date('2026-05-04T10:00:00.000Z');

    await expect(
      service.create(3, {
        numero: 42,
        rubros: 'laboral',
        idResolucion: 1,
        fechaHoraInicio: fecha,
        horaFin: null,
        proximaAudiencia: null,
        clausulas: null,
      } as any)
    ).resolves.toEqual({ id: 5 });
    expect(prisma.reclamos.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ idUsuario: 3, googleEventId: null, clausulas: Prisma.JsonNull }),
    });
  });

  it('no crea evento si Calendar no está conectado', async () => {
    calendar.existsCalendarForUser.mockResolvedValue(false);
    await expect(service.createEventInGoogleCalendar(3, 42, undefined, undefined, undefined, undefined)).resolves.toBeNull();
    expect(calendar.createEvent).not.toHaveBeenCalled();
  });

  it('reemplaza evento y crea audiencia con nombres, ordinal y duración por defecto', async () => {
    const start = new Date('2026-05-04T10:00:00.000Z');
    calendar.existsCalendarForUser.mockResolvedValue(true);
    partesService.findOne.mockImplementation(async (_userId: number, id: number) => ({ nombre: `Parte ${id}` }));
    prisma.reclamos.count.mockResolvedValue(2);
    calendar.createEvent.mockResolvedValue('new-event');

    await expect(service.createEventInGoogleCalendar(3, 42, start, undefined, [8], [7], 'old-event')).resolves.toBe(
      'new-event'
    );
    expect(calendar.deleteEvent).toHaveBeenCalledWith(3, 'old-event');
    expect(calendar.createEvent).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        title: 'Segunda Audiencia - Reclamo Nº 42',
        description: 'Reclamantes:\n- Parte 7\nReclamados:\n- Parte 8\n',
        start,
        end: new Date(start.getTime() + 60 * 60 * 1000),
      })
    );
  });

  it('rechaza la actualización si el reclamo no existe para ese usuario', async () => {
    prisma.reclamos.findUnique.mockResolvedValue(null);
    await expect(service.update(3, 5, {} as any)).rejects.toThrow('Reclamo con ID 5 no encontrado.');
    expect(prisma.reclamos.update).not.toHaveBeenCalled();
  });

  it('actualiza un reclamo del usuario, persiste JsonNull y transacciona relaciones', async () => {
    prisma.reclamos.findUnique.mockResolvedValue({
      id: 5,
      numero: 42,
      fechaHoraInicio: new Date('2026-05-04T10:00:00.000Z'),
      horaFin: null,
      googleEventId: 'event-5',
      partes: [],
    });
    const operation = Promise.resolve({ id: 5 });
    prisma.reclamos.update.mockReturnValue(operation);
    prisma.$transaction.mockResolvedValue([{ id: 5 }]);
    const fecha = new Date('2026-05-04T10:00:00.000Z');

    await service.update(3, 5, {
      numero: 42,
      rubros: 'laboral',
      idResolucion: 1,
      fechaHoraInicio: fecha,
      horaFin: null,
      proximaAudiencia: null,
      clausulas: null,
    } as any);

    expect(prisma.reclamos.findUnique).toHaveBeenCalledWith({ where: { idUsuario: 3, id: 5 }, include: { partes: true } });
    expect(prisma.reclamos.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { idUsuario: 3, id: 5 }, data: expect.objectContaining({ clausulas: Prisma.JsonNull }) })
    );
    expect(prisma.$transaction).toHaveBeenCalledWith([operation]);
  });

  it('elimina el evento solo si sigue conectado y elimina reclamo por usuario', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({ googleEventId: 'event-5' } as any);
    calendar.existsCalendarForUser.mockResolvedValue(true);

    await service.remove(3, 5);
    expect(calendar.deleteEvent).toHaveBeenCalledWith(3, 'event-5');
    expect(prisma.reclamos.delete).toHaveBeenCalledWith({ where: { idUsuario: 3, id: 5 } });
  });
});
