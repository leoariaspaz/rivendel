import { Injectable } from '@nestjs/common';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';
import { UpdateTipdocDto } from './dto/update-tipdoc.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  RelationshipValidation,
  RelationshipValidationResult,
} from 'src/pipes/interfaces/relationship-validation.interface';
import { ShouldExistRelationValidation, ValidateRelationResult } from 'src/validators/interfaces';
import { TipoDocumentoWhereInput } from 'src/generated/prisma/models/TipoDocumento';

@Injectable()
export class TipdocsService implements RelationshipValidation, ShouldExistRelationValidation {
  constructor(private prisma: PrismaService) {}
  create(createTipdocDto: CreateTipdocDto) {
    return this.prisma.tipoDocumento.create({
      data: {
        sintetico: createTipdocDto.sintetico,
        descripcion: createTipdocDto.descripcion,
      },
    });
  }

  findAll() {
    return this.prisma.tipoDocumento.findMany({
      orderBy: {
        sintetico: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.tipoDocumento.findUnique({
      where: { id },
    });
  }

  findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.tipoDocumento.findMany({
      skip,
      take: Number(limit),
      orderBy: {
        sintetico: 'asc',
      },
    });
  }

  getTotalCount() {
    return this.prisma.tipoDocumento.count();
  }

  update(id: number, updateTipdocDto: UpdateTipdocDto) {
    return this.prisma.tipoDocumento.update({
      where: { id },
      data: {
        sintetico: updateTipdocDto.sintetico,
        descripcion: updateTipdocDto.descripcion,
      },
    });
  }

  remove(id: number) {
    return this.prisma.tipoDocumento.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<ValidateRelationResult> {
    const exist = (await this.prisma.tipoDocumento.count({ where: { id: id } })) > 0;
    return { isValid: exist, message: exist ? '' : 'No existe el tipo de documento.' };
  }

  async isRelated(value: number): Promise<RelationshipValidationResult> {
    const parte = await this.prisma.tipoDocumento.findFirst({ where: { id: value }, select: { partes: true } });
    const cantPartes = parte?.partes?.length ?? 0;
    return { hasRelations: cantPartes > 0, message: cantPartes > 0 ? 'Hay partes relacionadas.' : '' };
  }

  async findBySintetico(filter: { id?: number; sintetico: string }): Promise<Boolean> {
    let args = { sintetico: filter.sintetico } as TipoDocumentoWhereInput;
    if (filter.id) {
      args = { ...args, id: filter.id };
    }
    return (await this.prisma.tipoDocumento.count({ where: args })) > 0;
  }
}
