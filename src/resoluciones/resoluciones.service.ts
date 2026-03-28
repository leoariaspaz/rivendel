import { Injectable } from '@nestjs/common';
import { CreateResolucionDto } from './dto/create-resolucion.dto';
import { UpdateResolucionDto } from './dto/update-resolucion.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  RelationshipValidation,
  RelationshipValidationResult,
} from 'src/pipes/interfaces/relationship-validation.interface';
import { ShouldExistRelationValidation, ValidateRelationResult } from 'src/validators/interfaces';

@Injectable()
export class ResolucionesService implements RelationshipValidation, ShouldExistRelationValidation {
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

  async exists(id: number): Promise<ValidateRelationResult> {
    const exist = (await this.prisma.resolucion.count({ where: { id } })) > 0;
    return { isValid: exist, message: exist ? '' : 'No existe la resolución.' };
  }

  async validate(value: number): Promise<RelationshipValidationResult> {
    const parte = await this.prisma.resolucion.findFirst({ where: { id: value }, select: { reclamos: true } });
    const cantReclamos = parte?.reclamos?.length ?? 0;
    if (cantReclamos > 0) {
      return { isValid: false, message: 'Hay reclamos relacionados.' };
    } else {
      return { isValid: false, message: '' };
    }
  }
}
