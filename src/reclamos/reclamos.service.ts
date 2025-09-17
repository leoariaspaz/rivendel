import { Injectable } from '@nestjs/common';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ReclamosService {
  constructor(private prisma: PrismaService) {}

  create(createReclamoDto: CreateReclamoDto) {
    return this.prisma.reclamos.create({
      data: {
        rubros: createReclamoDto.rubros,
        idResolucion: createReclamoDto.idResolucion,
        fechaHoraInicio: createReclamoDto.fechaHoraInicio,
        horaFin: createReclamoDto.horaFin,
        segundaFecha: createReclamoDto.segundaFecha,
        segFechaHoraInicio: createReclamoDto.segFechaHoraInicio,
        segHoraFin: createReclamoDto.segHoraFin,
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
      });
    }
    return this.prisma.reclamos.findMany({
      orderBy: {
        fechaHoraInicio: 'asc',
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

  update(id: number, updateReclamoDto: UpdateReclamoDto) {
    return this.prisma.reclamos.update({
      where: { id },
      data: {
        rubros: updateReclamoDto.rubros,
        idResolucion: updateReclamoDto.idResolucion,
        fechaHoraInicio: updateReclamoDto.fechaHoraInicio,
        horaFin: updateReclamoDto.horaFin,
        segundaFecha: updateReclamoDto.segundaFecha,
        segFechaHoraInicio: updateReclamoDto.segFechaHoraInicio,
        segHoraFin: updateReclamoDto.segHoraFin,
      },
    });
  }

  remove(id: number) {
    return this.prisma.reclamos.delete({
      where: { id },
    });
  }
}
