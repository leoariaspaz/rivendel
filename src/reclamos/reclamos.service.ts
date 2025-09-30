import { Injectable } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RECLAMADO, RECLAMANTE } from '../shared/utils/constants';
import { PartesReclamos } from '@prisma/client';

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
        segundaFecha: createReclamoDto.segundaFecha,
        segFechaHoraInicio: createReclamoDto.segFechaHoraInicio,
        segHoraFin: createReclamoDto.segHoraFin,
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
        orderBy: {
          fechaHoraInicio: 'asc',
        },
        include: { 
          partes: true 
        },
      });
    }
    return this.prisma.reclamos.findMany({
      orderBy: {
        fechaHoraInicio: 'asc',
      },
      include: { 
        partes: true 
      },
    });
  }

  findOne(id: number) {
    return this.prisma.reclamos.findUnique({
      where: { id },
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

    const partes = Array<{ idParte: number; rol: number }>();
    if (
      updateReclamoDto.reclamantes &&
      updateReclamoDto.reclamantes.length > 0
    ) {
      updateReclamoDto.reclamantes.forEach((idParte) =>
        partes.push({
          idParte: idParte,
          rol: RECLAMANTE,
        }),
      );
    }

    if (updateReclamoDto.reclamados && updateReclamoDto.reclamados.length > 0) {
      updateReclamoDto.reclamados.forEach((idParte) =>
        partes.push({
          idParte: idParte,
          rol: RECLAMADO,
        }),
      );
    }

    const partesToDelete = reclamo.partes
      .map((parte) => {
        if (
          !partes.find(
            (p) => p.idParte === parte.idParte && p.rol === parte.rol,
          )
        ) {
          return parte;
        }
      })
      .filter((parte) => parte !== undefined);

    return this.prisma.reclamos.update({
      where: { id },
      data: {
        numero: updateReclamoDto.numero,
        rubros: updateReclamoDto.rubros,
        idResolucion: updateReclamoDto.idResolucion,
        fechaHoraInicio: updateReclamoDto.fechaHoraInicio,
        horaFin: updateReclamoDto.horaFin,
        segundaFecha: updateReclamoDto.segundaFecha,
        segFechaHoraInicio: updateReclamoDto.segFechaHoraInicio,
        segHoraFin: updateReclamoDto.segHoraFin,
        partes: {
          deleteMany: partesToDelete,
          create: partes,
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
