import { Injectable } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ReclamosFindManyArgs, ReclamosSelect, ReclamosWhereInput } from 'src/generated/prisma/models';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';
import { ReclamosListItemDTO } from './dto/reclamos-list-item.dto';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PartesReclamosList } from 'src/partes-reclamos/models/partes-reclamos-list';

@Injectable()
export class ReclamosService {
  constructor(private prisma: PrismaService) {}

  getWhere(idUsuario: number, query: string | null): ReclamosWhereInput {
    let w = { idUsuario } as ReclamosWhereInput;
    if (query) {
      const ORQuery: ReclamosWhereInput[] = [
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

  create(idUsuario: number, createReclamoDto: CreateReclamoDto) {
    const newPartes = new PartesReclamosList().getNewPartes(createReclamoDto.reclamados, createReclamoDto.reclamantes);

    return this.prisma.reclamos.create({
      data: {
        numero: createReclamoDto.numero,
        rubros: createReclamoDto.rubros,
        idResolucion: createReclamoDto.idResolucion,
        fechaHoraInicio: createReclamoDto.fechaHoraInicio,
        horaFin: createReclamoDto.horaFin,
        proximaAudiencia: createReclamoDto.proximaAudiencia,
        partes: { create: newPartes },
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
    } satisfies ReclamosSelect;

    let skip: number | undefined;
    let take: number | undefined;
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
    } satisfies ReclamosFindManyArgs;

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

  findOne(idUsuario: number, id: number) {
    return this.prisma.reclamos.findUnique({
      where: { idUsuario, id },
      select: {
        id: true,
        numero: true,
        rubros: true,
        idResolucion: true,
        fechaHoraInicio: true,
        horaFin: true,
        proximaAudiencia: true,
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
      },
    });
  }

  getTotalCount(idUsuario: number, query: string | null): Promise<number> {
    return this.prisma.reclamos.count({ where: this.getWhere(idUsuario, query) });
  }

  async update(idUsuario: number, id: number, updateReclamoDto: UpdateReclamoDto) {
    const reclamo = await this.prisma.reclamos.findUnique({
      where: { idUsuario, id },
      include: { partes: true },
    });

    if (!reclamo) {
      throw new Error(`Reclamo con ID ${id} no encontrado.`);
    }

    //creamos los nuevos partes que no existían antes
    const newPartes = new PartesReclamosList(reclamo.partes).getNewPartes(
      updateReclamoDto.reclamados,
      updateReclamoDto.reclamantes
    );

    //actualizamos los que ya existen
    const existingPartes = new PartesReclamosList(reclamo.partes).getUpdatedPartes(
      updateReclamoDto.reclamados,
      updateReclamoDto.reclamantes
    );

    //eliminamos los que no están en el dto
    const removedPartes = new PartesReclamosList(reclamo.partes).getRemovedPartes(
      updateReclamoDto.reclamados,
      updateReclamoDto.reclamantes
    );

    const createAndDelete = this.prisma.reclamos.update({
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
      },
      include: {
        partes: true,
      },
    });

    const updateMany = existingPartes.update(this.prisma);

    return this.prisma.$transaction([createAndDelete, ...(updateMany as [])]);
  }

  remove(idUsuario: number, id: number) {
    return this.prisma.reclamos.delete({
      where: { idUsuario, id },
    });
  }

  async isUnique(
    idUsuario: number,
    filter: { id?: number; numero: number | undefined; fecha: Date | undefined }
  ): Promise<boolean> {
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
      idUsuario,
    } as ReclamosWhereInput;

    if (filter.id) {
      args = { ...args, id: { not: filter.id } };
    }

    return (await this.prisma.reclamos.count({ where: args })) === 0;
  }

  count(idUsuario: number, numero: number, fecha?: Date) {
    const POSTERGADO = 4;
    const FRACASO = 5;
    return this.prisma.reclamos.count({
      where: {
        idUsuario,
        numero,
        OR: [{ idResolucion: POSTERGADO }, { idResolucion: FRACASO }],
        fechaHoraInicio: {
          lte: fecha ?? new Date(),
        },
      },
    });
  }
}
