import { Injectable } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from '@prisma/client';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';
import { ReclamosListItemDTO } from './dto/reclamos-list-item.dto';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PartesReclamosList } from 'src/partes-reclamos/models/partes-reclamos-list';
import { FindOneReclamo } from './models/find-one-reclamo';
import { plainToInstance } from 'class-transformer';
import { POSTERGADO } from 'src/resoluciones/resoluciones.constants';
import { PartesReclamosService } from 'src/partes-reclamos/partes-reclamos.service';
import { assertValidTiptapDocument } from 'src/validators/validate-tiptap-document';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { PartesService } from 'src/partes/partes.service';

@Injectable()
export class ReclamosService {
  constructor(
    private prisma: PrismaService,
    private partesService: PartesService,
    private googleCalendarService: GoogleCalendarService
  ) {}

  getWhere(idUsuario: number, query: string | null): Prisma.ReclamosWhereInput {
    let w = { idUsuario } as Prisma.ReclamosWhereInput;
    if (query) {
      const ORQuery: Prisma.ReclamosWhereInput[] = [
        {
          partes: {
            some: {
              parte: {
                nombre: { contains: query },
              },
            },
          },
        },
      ];

      if (!Number.isNaN(Number(query))) {
        ORQuery.push({ numero: { equals: Number(query) } });
      }

      dayjs.extend(customParseFormat);
      const formats = ['D/M/YYYY', 'D-M-YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'];
      const date = dayjs(query, formats, true);
      if (date.isValid()) {
        const inicioDia = date.toDate();
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = date.toDate();
        finDia.setHours(23, 59, 59, 999);
        const condition = {
          fechaHoraInicio: {
            gte: inicioDia,
            lte: finDia,
          },
        };

        ORQuery.push(condition);
      }

      w = {
        AND: [
          w,
          {
            OR: ORQuery,
          },
        ],
      };
    }
    return w;
  }

  async createEventInGoogleCalendar(
    idUsuario: number,
    nroReclamo: number,
    start: Date | undefined = new Date(),
    end: Date | undefined,
    reclamados: number[] | undefined,
    reclamantes: number[] | undefined,
    replaceId: string | null = null
  ): Promise<string | null> {
    async function getParteNames(partesService: PartesService, partesIds: number[], title: string): Promise<string> {
      const partes = await Promise.all(
        partesIds.map(async (parteId) => {
          const parte = await partesService.findOne(idUsuario, parteId);
          return parte ? parte.nombre : '';
        })
      );

      const nombres = partes.filter((name) => name !== '');
      if (nombres.length > 0) {
        return `${title}:\n` + nombres.map((name) => `- ${name}`).join('\n') + '\n';
      }

      return '';
    }

    if (!(await this.googleCalendarService.existsCalendarForUser(idUsuario))) return null;

    let partes = '';

    if (reclamantes && reclamantes.length > 0) {
      partes += await getParteNames(this.partesService, reclamantes, 'Reclamantes');
    }

    if (reclamados && reclamados.length > 0) {
      partes += await getParteNames(this.partesService, reclamados, 'Reclamados');
    }

    if (replaceId) {
      await this.googleCalendarService.deleteEvent(idUsuario, replaceId);
    }

    const cantidad = await this.count(idUsuario, nroReclamo, start);
    let title = `Audiencia - Reclamo Nº ${nroReclamo}`;
    if (cantidad > 0) {
      const unidades = ['', '', 'Segunda ', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima', 'Octava', 'Novena'];
      title = `${unidades[cantidad]} Audiencia - Reclamo Nº ${nroReclamo}`.trim();
    }

    const data = {
      title,
      description: partes,
      start,
      end: end || new Date(start.getTime() + 60 * 60 * 1000), // Si no hay horaFin, asumimos 60 minutos después de fechaHoraInicio
    };
    return await this.googleCalendarService.createEvent(idUsuario, data);
  }

  async create(idUsuario: number, createReclamoDto: CreateReclamoDto) {
    if (createReclamoDto.clausulas) {
      assertValidTiptapDocument(createReclamoDto.clausulas);
    }

    const newPartes = new PartesReclamosService().getNew(
      new PartesReclamosList(),
      createReclamoDto.reclamados,
      createReclamoDto.reclamantes
    );

    const eventLink = await this.createEventInGoogleCalendar(
      idUsuario,
      createReclamoDto.numero,
      createReclamoDto.fechaHoraInicio,
      createReclamoDto.horaFin,
      createReclamoDto.reclamados?.map((p) => p.idParte),
      createReclamoDto.reclamantes?.map((p) => p.idParte)
    );

    return await this.prisma.reclamos.create({
      data: {
        numero: createReclamoDto.numero,
        rubros: createReclamoDto.rubros,
        idResolucion: createReclamoDto.idResolucion,
        fechaHoraInicio: createReclamoDto.fechaHoraInicio,
        horaFin: createReclamoDto.horaFin,
        proximaAudiencia: createReclamoDto.proximaAudiencia,
        partes: { create: newPartes },
        clausulas:
          createReclamoDto.clausulas != null
            ? (createReclamoDto.clausulas as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        googleEventId: eventLink,
        idUsuario,
      },
    });
  }

  findAll(
    idUsuario: number,
    query: string | null,
    page: number | null,
    limit: number | null
  ): Promise<ReclamosListItemDTO[]> {
    const fields = {
      id: true,
      numero: true,
      fechaHoraInicio: true,
      horaFin: true,
      idResolucion: true,
      proximaAudiencia: true,
      partes: {
        select: {
          rol: true,
          parte: {
            select: {
              id: true,
              nombre: true,
              cuil: true,
            },
          },
        },
      },
    } satisfies Prisma.ReclamosSelect;

    let skip: number | undefined = undefined;
    let take: number | undefined = undefined;
    if (page && limit && page > 0) {
      skip = (page - 1) * limit;
      take = Number(limit);
    }

    const args = {
      select: fields,
      where: this.getWhere(idUsuario, query),
      orderBy: [{ numero: 'asc' }, { fechaHoraInicio: 'asc' }],
      skip,
      take,
    } satisfies Prisma.ReclamosFindManyArgs;

    const results = this.prisma.reclamos.findMany(args) as Promise<ReclamosListItemDTO[]>;
    const resSrv = new ResolucionesService();

    return results.then((reclamos): ReclamosListItemDTO[] => {
      return reclamos.map((reclamo): ReclamosListItemDTO => {
        return {
          ...reclamo,
          resolucion: resSrv.getDescripcion(reclamo.idResolucion),
        };
      });
    });
  }

  async findOne(idUsuario: number, id: number): Promise<FindOneReclamo> {
    const result = await this.prisma.reclamos.findUnique({
      where: { idUsuario, id },
      select: {
        id: true,
        numero: true,
        rubros: true,
        idResolucion: true,
        fechaHoraInicio: true,
        horaFin: true,
        proximaAudiencia: true,
        clausulas: true,
        googleEventId: true,
        partes: {
          select: {
            idParte: true,
            rol: true,
            nroWhatsappParte: true,
            nroWhatsappPatrocinante: true,
            postergo: true,
            incomparendo: true,
            multado: true,
            parte: {
              select: {
                id: true,
                nombre: true,
                nroDocumento: true,
                cuil: true,
                domicilio: true,
                localidad: true,
                tipoDocumento: {
                  select: {
                    sintetico: true,
                  },
                },
                patrocinante: {
                  select: {
                    nroMatricula: true,
                    nombre: true,
                    domicilio: true,
                    localidad: true,
                    nroCasillero: true,
                  },
                },
                esApoderado: true,
              },
            },
          },
        },
        usuario: {
          select: {
            nombre: true,
            nroHabilitacion: true,
          },
        },
      },
    });

    const reclamo = plainToInstance(FindOneReclamo, result);
    if (reclamo.clausulas) {
      assertValidTiptapDocument(reclamo.clausulas);
    }
    return reclamo;
  }

  getTotalCount(idUsuario: number, query: string | null): Promise<number> {
    return this.prisma.reclamos.count({ where: this.getWhere(idUsuario, query) });
  }

  async update(idUsuario: number, id: number, updateReclamoDto: UpdateReclamoDto) {
    if (updateReclamoDto.clausulas) {
      assertValidTiptapDocument(updateReclamoDto.clausulas);
    }

    const reclamo = await this.prisma.reclamos.findUnique({
      where: { idUsuario, id },
      include: { partes: true },
    });

    if (!reclamo) {
      throw new Error(`Reclamo con ID ${id} no encontrado.`);
    }

    const partesReclamosService: PartesReclamosService = new PartesReclamosService();

    //creamos los nuevos partes que no existían antes
    const newPartes = partesReclamosService.getNew(
      new PartesReclamosList(reclamo.partes),
      updateReclamoDto.reclamados,
      updateReclamoDto.reclamantes
    );

    //actualizamos los que ya existen
    const existingPartes = partesReclamosService.getUpdated(
      new PartesReclamosList(reclamo.partes),
      updateReclamoDto.reclamados,
      updateReclamoDto.reclamantes
    );

    //eliminamos los que no están en el dto
    const removedPartes = partesReclamosService.getRemoved(
      new PartesReclamosList(reclamo.partes),
      updateReclamoDto.reclamados,
      updateReclamoDto.reclamantes
    );

    let eventId: string | null = reclamo.googleEventId;
    if (
      !eventId ||
      reclamo.fechaHoraInicio.getTime() !== updateReclamoDto.fechaHoraInicio?.getTime() ||
      reclamo.horaFin?.getTime() !== updateReclamoDto.horaFin?.getTime()
    ) {
      eventId = await this.createEventInGoogleCalendar(
        idUsuario,
        reclamo.numero,
        updateReclamoDto.fechaHoraInicio,
        updateReclamoDto.horaFin,
        updateReclamoDto.reclamados?.map((p) => p.idParte),
        updateReclamoDto.reclamantes?.map((p) => p.idParte),
        eventId
      );
    }

    const createOrDelete = this.prisma.reclamos.update({
      where: { id },
      data: {
        numero: updateReclamoDto.numero,
        rubros: updateReclamoDto.rubros,
        idResolucion: updateReclamoDto.idResolucion,
        fechaHoraInicio: updateReclamoDto.fechaHoraInicio,
        horaFin: updateReclamoDto.horaFin,
        partes: {
          createMany: { data: newPartes },
          deleteMany: removedPartes,
        },
        proximaAudiencia: updateReclamoDto.proximaAudiencia,
        clausulas:
          updateReclamoDto.clausulas != null
            ? (updateReclamoDto.clausulas as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        googleEventId: eventId,
      },
      include: {
        partes: true,
      },
    });

    const updateMany = partesReclamosService.update(this.prisma, existingPartes);

    return this.prisma.$transaction([createOrDelete, ...(updateMany as [])]);
  }

  async remove(idUsuario: number, id: number): Promise<void> {
    const reclamo = await this.findOne(idUsuario, id);
    if (reclamo.googleEventId) {
      if (await this.googleCalendarService.existsCalendarForUser(idUsuario)) {
        await this.googleCalendarService.deleteEvent(idUsuario, reclamo.googleEventId);
      }
    }
    await this.prisma.reclamos.delete({
      where: { idUsuario, id },
    });
  }

  async isUnique(filter: { id?: number; numero: number | undefined; fecha: Date | undefined }): Promise<boolean> {
    const inicioDia = new Date(filter.fecha ?? '');
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(filter.fecha ?? '');
    finDia.setHours(23, 59, 59, 999);

    let args = {
      numero: filter.numero,
      fechaHoraInicio: {
        gte: inicioDia,
        lte: finDia,
      },
    } as Prisma.ReclamosWhereInput;

    if (filter.id) {
      args = { ...args, id: { not: filter.id } };
    }

    return (await this.prisma.reclamos.count({ where: args })) === 0;
  }

  count(idUsuario: number, numero: number, fecha?: Date) {
    return this.prisma.reclamos.count({
      where: {
        idUsuario,
        numero,
        OR: [{ idResolucion: POSTERGADO }],
        fechaHoraInicio: {
          lte: fecha ?? new Date(),
        },
      },
    });
  }
}
