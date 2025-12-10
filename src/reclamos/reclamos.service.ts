import { Injectable } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RECLAMADO, RECLAMANTE } from '../shared/utils/constants';
import { PartesReclamoDTO } from './dto/partes-reclamo.dto';

@Injectable()
export class ReclamosService {
  constructor(private prisma: PrismaService) {}

  create(createReclamoDto: CreateReclamoDto) {
    const partes = Array<{ idParte: number; rol: number }>();

    if (
      createReclamoDto.reclamantes &&
      createReclamoDto.reclamantes.length > 0
    ) {
      createReclamoDto.reclamantes.forEach((idParte) =>
        partes.push({
          idParte: idParte,
          rol: RECLAMANTE,
        }),
      );
    }

    if (createReclamoDto.reclamados && createReclamoDto.reclamados.length > 0) {
      createReclamoDto.reclamados.forEach((idParte) =>
        partes.push({
          idParte: idParte,
          rol: RECLAMADO,
        }),
      );
    }

    return this.prisma.reclamos.create({
      data: {
        numero: createReclamoDto.numero,
        rubros: createReclamoDto.rubros,
        idResolucion: createReclamoDto.idResolucion,
        fechaHoraInicio: createReclamoDto.fechaHoraInicio,
        horaFin: createReclamoDto.horaFin,
        partes: {
          create: partes,
        },
      },
    });
  }

  findAll({ page, limit }: { page?: number; limit?: number } = {}) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      return this.prisma.reclamos.findMany({
        skip,
        take: Number(limit),
        orderBy: [
          { numero: 'asc' },
          { fechaHoraInicio: 'asc' },
        ],
        select: {
          id: true,
          numero: true,
          rubros: true,
          resolucion: {
            select: {
              id: true,
              descripcion: true,
            },
          },
          fechaHoraInicio: true,
          horaFin: true,
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
        },
      });
    }
    return this.prisma.reclamos.findMany({
      orderBy: [
        { numero: 'asc' },
        { fechaHoraInicio: 'asc' },
      ],
      // include: { 
      //   resolucion: true,
      //   partes: true 
      // },
      select: {
        id: true,
        numero: true,
        rubros: true,
        resolucion: {
          select: {
            id: true,
            descripcion: true,
          },
        },
        fechaHoraInicio: true,
        horaFin: true,
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
      },
    });
  }

  findOne(id: number) {
    return this.prisma.reclamos.findUnique({
      where: { id },
      select: {
        id: true,
        numero: true,
        rubros: true,
        idResolucion: true,
        resolucion: {
          select: {
            detalle: true,
          },
        },
        fechaHoraInicio: true,
        horaFin: true,
        partes: {
          select: {
            idParte: true,
            rol: true,
            parte: {
              select: {
                id: true,
                nombre: true,
                nroDocumento: true,
                cuil: true,
                domicilio: true,
                localidad: true,
                nroWhatsapp: true,
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
                    nroWhatsapp: true
                  },
                }
              },
            },
          },
        },
      },
    });
  }

  getTotalCount() {
    return this.prisma.reclamos.count();
  }

  async update(id: number, updateReclamoDto: UpdateReclamoDto) {
    console.log('UpdateReclamoDto:', id, updateReclamoDto, updateReclamoDto.numero);

    const reclamo = await this.prisma.reclamos.findUnique({
      where: { id: id },
      include: {
        partes: true,
      },
    });

    if (!reclamo) {
      throw new Error(`Reclamo con ID ${id} no encontrado.`);
    }

    const partesToCreate = Array<PartesReclamoDTO>();
    const partesToDelete = Array<PartesReclamoDTO>();

    const exclude = (from: number[] | undefined, where: Array<PartesReclamoDTO>, 
      to: Array<PartesReclamoDTO>, tipoRol: number) => {
      from?.filter(
        (idParte) =>
          !where.find(
            (p) => p.idParte === idParte && p.rol === tipoRol,
          ),
      )
      .forEach((idParte) => to.push({
        idParte: Number(idParte),
        rol: tipoRol,
      }));
    }

    exclude(updateReclamoDto.reclamados, reclamo.partes, partesToCreate, RECLAMADO);
    exclude(updateReclamoDto.reclamantes, reclamo.partes, partesToCreate, RECLAMANTE);
   
    const getPartesReclamosByRol = (rol: number) => 
      reclamo.partes?.filter((p) => p.rol === rol).map(p => p.idParte)

    const getWhereByRol = (rol: number) => {
      const where = Array<PartesReclamoDTO>();
      if (rol === RECLAMADO && updateReclamoDto.reclamados) {
        where.push(...updateReclamoDto.reclamados.map(p => { 
            return { idParte: p, rol: rol}
        }))
      }
      if (rol === RECLAMANTE && updateReclamoDto.reclamantes) {
        where.push(...updateReclamoDto.reclamantes.map(p => { 
            return { idParte: p, rol: rol}
        }))
      }

      return where
    }

    exclude(getPartesReclamosByRol(RECLAMADO), getWhereByRol(RECLAMADO), partesToDelete, RECLAMADO);
    exclude(getPartesReclamosByRol(RECLAMANTE), getWhereByRol(RECLAMANTE), partesToDelete, RECLAMANTE);

    return this.prisma.reclamos.update({
      where: { id },
      data: {
        numero: updateReclamoDto.numero,
        rubros: updateReclamoDto.rubros,
        idResolucion: updateReclamoDto.idResolucion,
        fechaHoraInicio: updateReclamoDto.fechaHoraInicio,
        horaFin: updateReclamoDto.horaFin,
        partes: {
          deleteMany: partesToDelete,
          create: partesToCreate,
        },
      },
      include: {
        partes: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.reclamos.delete({
      where: { id },
    });
  }
}
