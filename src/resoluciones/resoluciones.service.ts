import { Injectable } from '@nestjs/common';
import { CreateResolucionDto } from './dto/create-resolucion.dto';
import { UpdateResolucionDto } from './dto/update-resolucion.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ResolucionesService {
  constructor(private prisma: PrismaService) {}

  create(createResolucionDto: CreateResolucionDto) {
    return this.prisma.resolucion.create({
      data: {
        descripcion: createResolucionDto.descripcion,
        detalle: createResolucionDto.detalle,
      },
    });
  }

  findAll({ page, limit }: { page?: number; limit?: number } = {}) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      return this.prisma.resolucion.findMany({
        skip,
        take: Number(limit),
        orderBy: {
          descripcion: 'asc',
        },
      });
    }
    return this.prisma.resolucion.findMany({
      orderBy: {
        descripcion: 'asc',
      },
    });
  }

  getTotalCount() {
    return this.prisma.resolucion.count();
  }

  findOne(id: number) {
    return this.prisma.resolucion.findUnique({
      where: { id },
    });
  }

  update(id: number, updateResolucionDto: UpdateResolucionDto) {
    return this.prisma.resolucion.update({
      where: { id },
      data: {
        descripcion: updateResolucionDto.descripcion,
        detalle: updateResolucionDto.detalle,
      },
    });
  }

  remove(id: number) {
    return this.prisma.resolucion.delete({
      where: { id },
    });
  }
}
