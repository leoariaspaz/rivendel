import { Injectable } from '@nestjs/common';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  RelationshipValidation,
  RelationshipValidationResult,
} from 'src/pipes/interfaces/relationship-validation.interface';
import { ShouldExistRelationValidation, ValidateRelationResult } from 'src/validators/interfaces';
import { PatrocinanteWhereInput } from 'src/generated/prisma/models';

@Injectable()
export class PatrocinantesService implements RelationshipValidation, ShouldExistRelationValidation {
  constructor(private prisma: PrismaService) {}

  create(createPatrocinanteDto: CreatePatrocinanteDto) {
    return this.prisma.patrocinante.create({
      data: {
        nombre: createPatrocinanteDto.nombre,
        nroMatricula: Number(createPatrocinanteDto.nroMatricula),
        domicilio: createPatrocinanteDto.domicilio,
        localidad: createPatrocinanteDto.localidad,
        nroCasillero: Number(createPatrocinanteDto.nroCasillero),
      },
    });
  }

  findAll(query: string | null, page: number | null, limit: number | null) {
    let skip: number | undefined, l: number | undefined;
    if (page && limit) {
      l = Number(limit);
      skip = (page - 1) * limit;
    } else {
      l = undefined;
      skip = undefined;
    }
    let filter = {};
    if (query) {
      filter = {
        OR: [
          {
            nombre: {
              contains: query === null ? undefined : query,
            },
          },
          {
            nroMatricula: {
              equals: isNaN(Number(query)) ? undefined : Number(query),
            },
          },
          {
            nroCasillero: {
              equals: isNaN(Number(query)) ? undefined : Number(query),
            },
          },
        ],
      };
    }
    return this.prisma.patrocinante.findMany({
      where: filter,
      skip: skip,
      take: l,
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.patrocinante.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePatrocinanteDto: UpdatePatrocinanteDto) {
    return this.prisma.patrocinante.update({
      where: { id },
      data: {
        nombre: updatePatrocinanteDto.nombre,
        nroMatricula: Number(updatePatrocinanteDto.nroMatricula),
        domicilio: updatePatrocinanteDto.domicilio,
        localidad: updatePatrocinanteDto.localidad,
        nroCasillero: Number(updatePatrocinanteDto.nroCasillero),
      },
    });
  }

  remove(id: number) {
    return this.prisma.patrocinante.delete({
      where: { id },
    });
  }

  getTotalCount(query: string | null) {
    let filter = {};
    if (query) {
      filter = {
        OR: [
          {
            nombre: {
              contains: query === null ? undefined : query,
            },
          },
          {
            nroMatricula: {
              equals: isNaN(Number(query)) ? undefined : Number(query),
            },
          },
          {
            nroCasillero: {
              equals: isNaN(Number(query)) ? undefined : Number(query),
            },
          },
        ],
      };
    }
    return this.prisma.patrocinante.count({ where: filter });
  }

  async exists(id: number): Promise<ValidateRelationResult> {
    if (id === 0) return { isValid: true, message: undefined };
    const exist = (await this.prisma.patrocinante.count({ where: { id } })) > 0;
    return { isValid: exist, message: exist ? '' : 'No existe el patrocinante.' };
  }

  async existsNroMatricula(nroMatricula: number) {
    return (await this.prisma.patrocinante.findFirst({ where: { nroMatricula } })) !== null;
  }

  async isRelated(value: number): Promise<RelationshipValidationResult> {
    const p = await this.prisma.patrocinante.findFirst({ where: { id: value }, select: { partes: true } });
    const cantPartes = p?.partes?.length ?? 0;
    return { hasRelations: cantPartes > 0, message: cantPartes > 0 ? 'Hay partes relacionadas.' : '' };
  }

  async isUnique(filter: { id?: number | undefined, nroMatricula: number | undefined }): Promise<Boolean> {
    let args = { nroMatricula: filter.nroMatricula } as PatrocinanteWhereInput;
    if (filter.id) {
      args = { ...args, id: { not: filter.id } };
    }
    return await this.prisma.patrocinante.count({ where: args }) === 0;
  }
}
