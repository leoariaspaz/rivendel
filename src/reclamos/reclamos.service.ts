import { Injectable } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RECLAMADO, RECLAMANTE } from '../shared/utils/constants';
import { PartesReclamoDTO } from './dto/partes-reclamo.dto';
import { PartesReclamos } from 'src/generated/prisma/client';
import { Reclamo } from './entities/reclamo.entity';

@Injectable()
export class ReclamosService {
  constructor(private prisma: PrismaService) {}

  create(createReclamoDto: CreateReclamoDto) {
    const partes = Array<PartesReclamoDTO>();

    if (
      createReclamoDto.reclamantes &&
      createReclamoDto.reclamantes.length > 0
    ) {
      createReclamoDto.reclamantes.forEach((parte) =>
        partes.push({
          idParte: parte.idParte,
          rol: RECLAMANTE,
          nroWhatsappParte: parte.nroWhatsappParte,
          nroWhatsappPatrocinante: parte.nroWhatsappPatrocinante
        }),
      );
    }

    if (createReclamoDto.reclamados && createReclamoDto.reclamados.length > 0) {
      createReclamoDto.reclamados.forEach((parte) =>
        partes.push({
          idParte: parte.idParte,
          rol: RECLAMADO,
          nroWhatsappParte: parte.nroWhatsappParte,
          nroWhatsappPatrocinante: parte.nroWhatsappPatrocinante
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
            nroWhatsappParte: true,
            nroWhatsappPatrocinante: true,
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
    const reclamo = await this.prisma.reclamos.findUnique({
      where: { id: id },
      include: {
        partes: true,
      },
    });

    if (!reclamo) {
      throw new Error(`Reclamo con ID ${id} no encontrado.`);
    }

    const restarPartes = (tipoRol: number, A: PartesReclamoDTO[] | undefined, 
      B: Array<PartesReclamos>): PartesReclamoDTO[] => {
        return A?.
                filter((parte) => !B.find((p) => p.idParte === parte.idParte && p.rol === tipoRol)).
                map((parte) => {
                  return {
                    idParte: parte.idParte,
                    rol: tipoRol,
                    nroWhatsappParte: parte.nroWhatsappParte,
                    nroWhatsappPatrocinante: parte.nroWhatsappPatrocinante
                  }
                }) || [];
    }

    const partesToCreate = restarPartes(RECLAMADO, updateReclamoDto.reclamados, reclamo.partes)
                      .concat(restarPartes(RECLAMANTE, updateReclamoDto.reclamantes, reclamo.partes));
   
    const mapParteToPartesReclamos = (rol: number, partes: PartesReclamoDTO[] | undefined): PartesReclamos[] => {
      return partes?.map(p => { 
          return { 
            id: 0,
            idParte: p.idParte,
            idReclamo: 0,
            rol: rol,
            nroWhatsappParte: p.nroWhatsappParte || null,
            nroWhatsappPatrocinante: p.nroWhatsappPatrocinante || null
          }
      }) || [];
    }

    const partesToUpdate = mapParteToPartesReclamos(RECLAMADO, updateReclamoDto.reclamados)
                          .concat(mapParteToPartesReclamos(RECLAMANTE, updateReclamoDto.reclamantes))
                          .filter(p => reclamo.partes.some(rp => rp.idParte === p.idParte && rp.rol === p.rol))
                          .map(p => {
                            return {
                              id: reclamo.partes.find(rp => rp.idParte === p.idParte && rp.rol === p.rol)?.id || 0,
                              idParte: p.idParte,
                              rol: p.rol,
                              nroWhatsappParte: p.nroWhatsappParte || null,
                              nroWhatsappPatrocinante: p.nroWhatsappPatrocinante || null
                            }
                          });

    const reclamadosEnDB = reclamo.partes?.filter((p) => p.rol === RECLAMADO)
    const reclamantesEnDB = reclamo.partes?.filter((p) => p.rol === RECLAMANTE)
    const reclamadosAGrabar = mapParteToPartesReclamos(RECLAMADO, updateReclamoDto.reclamados);
    const reclamantesAGrabar = mapParteToPartesReclamos(RECLAMANTE, updateReclamoDto.reclamantes);
    const partesToDelete = restarPartes(RECLAMADO, reclamadosEnDB, reclamadosAGrabar)
                      .concat(restarPartes(RECLAMANTE, reclamantesEnDB, reclamantesAGrabar));

    const deleteOrCreate = this.prisma.reclamos.update({
      where: { id },
      data: {
        numero: updateReclamoDto.numero,
        rubros: updateReclamoDto.rubros,
        idResolucion: updateReclamoDto.idResolucion,
        fechaHoraInicio: updateReclamoDto.fechaHoraInicio,
        horaFin: updateReclamoDto.horaFin,
        partes: {
          deleteMany: partesToDelete,
          createMany: { data: partesToCreate },
        },
      },
      include: {
        partes: true,
      },
    });

    let updateMany: any[] = [];
    for (const parte of partesToUpdate) {
      updateMany.push(
        this.prisma.partesReclamos.update({
          where: { id: parte.id },
          data: {
            rol: parte.rol,
            nroWhatsappParte: parte.nroWhatsappParte,
            nroWhatsappPatrocinante: parte.nroWhatsappPatrocinante
          }
        })
      );
    }

    return this.prisma.$transaction([deleteOrCreate, ...updateMany]);
  }

  remove(id: number) {
    return this.prisma.reclamos.delete({
      where: { id },
    });
  }
}
