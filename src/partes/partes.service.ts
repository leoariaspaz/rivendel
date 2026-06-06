import { Injectable } from '@nestjs/common';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { FindOneParte } from './models/find-one-parte';
import { FindOneParteDTO } from './dto/find-one-parte.dto';
import { ParteFindManyArgs, ParteWhereInput } from 'src/generated/prisma/models';
import {
  RelationshipValidation,
  RelationshipValidationResult,
} from '../pipes/interfaces/relationship-validation.interface';
import { ShouldExistRelationValidation, ValidateRelationResult } from 'src/validators/interfaces';

@Injectable()
export class PartesService implements RelationshipValidation, ShouldExistRelationValidation {
  constructor(private prisma: PrismaService) {}

  private SELECT_FIELDS = {
    id: true,
    nroDocumento: true,
    cuil: true,
    nombre: true,
    domicilio: true,
    localidad: true,
    idTipoDocumento: true,
    tipoDocumento: {
      select: { sintetico: true },
    },
    idPatrocinante: true,
    patrocinante: {
      select: {
        nroMatricula: true,
        nombre: true,
        domicilio: true,
        localidad: true,
      },
    },
    esApoderado: true,
  } as const;

  private mapParteToDTO(p: FindOneParte): FindOneParteDTO {
    const result = {
      id: p.id,
      nroDocumento: p.nroDocumento,
      cuil: p.cuil,
      nombre: p.nombre,
      domicilio: p.domicilio === null ? '' : p.domicilio,
      localidad: p.localidad === null ? '' : p.localidad,
      idTipoDocumento: p.idTipoDocumento,
      tipoDocumento: p.tipoDocumento.sintetico,
      esApoderado: p.esApoderado,
    } as FindOneParteDTO;

    if (p.patrocinante) {
      result.patrocinante = {
        id: p.idPatrocinante || 0,
        nombre: p.patrocinante.nombre,
        nroMatricula: p.patrocinante.nroMatricula,
        domicilio: p.patrocinante.domicilio,
        localidad: p.patrocinante.localidad,
      };
    }

    return result;
  }

  private mapParteListToDTOList(data: FindOneParte[]): FindOneParteDTO[] {
    return data.map((p) => this.mapParteToDTO(p));
  }

  private getWhere(idUsuario: number, query: string | null): ParteWhereInput {
    let w = { idUsuario } as ParteWhereInput;
    if (query) {
      w = {
        ...w,
        OR: [
          {
            nombre: {
              contains: query,
            },
          },
          {
            cuil: {
              contains: query,
            },
          },
        ],
      };
    }
    return w;
  }

  create(idUsuario: number, createParteDto: CreateParteDto) {
    const idPatrocinante = (createParteDto.idPatrocinante ?? 0 > 0) ? createParteDto.idPatrocinante : null;
    return this.prisma.parte.create({
      data: {
        nombre: createParteDto.nombre,
        idTipoDocumento: createParteDto.idTipoDocumento,
        nroDocumento: createParteDto.nroDocumento,
        cuil: createParteDto.cuil ?? '',
        idPatrocinante,
        esApoderado: createParteDto.esApoderado,
        domicilio: createParteDto.domicilio,
        localidad: createParteDto.localidad,
        idUsuario,
      },
    });
  }

  async findOne(idUsuario: number, id: number) {
    const p = await this.prisma.parte.findUnique({
      where: { id, idUsuario },
      select: this.SELECT_FIELDS,
    });

    if (p) return this.mapParteToDTO(p);
    return null;
  }

  update(idUsuario: number, id: number, updateParteDto: UpdateParteDto) {
    const idPatrocinante = updateParteDto.idPatrocinante ? Number(updateParteDto.idPatrocinante) : null;
    return this.prisma.parte.update({
      where: { idUsuario, id },
      data: {
        nombre: updateParteDto.nombre,
        idTipoDocumento: Number(updateParteDto.idTipoDocumento),
        nroDocumento: updateParteDto.nroDocumento,
        cuil: updateParteDto.cuil,
        idPatrocinante: idPatrocinante,
        esApoderado: updateParteDto.esApoderado,
        domicilio: updateParteDto.domicilio,
        localidad: updateParteDto.localidad,
      },
    });
  }

  remove(idUsuario: number, id: number) {
    return this.prisma.parte.delete({
      where: { id, idUsuario },
    });
  }

  getTotalCount(idUsuario: number, query: string | null) {
    return this.prisma.parte.count({ where: this.getWhere(idUsuario, query) });
  }

  findAll(idUsuario: number, query: string | null, page: number | null, limit: number | null) {
    let filters: ParteFindManyArgs = { where: this.getWhere(idUsuario, query) };
    if (page && limit && page > 0) {
      const skip = (page - 1) * limit;
      filters = { ...filters, skip, take: Number(limit) };
    }

    return this.prisma.parte
      .findMany({
        ...filters,
        select: this.SELECT_FIELDS,
        orderBy: [{ nombre: 'asc' }, { nroDocumento: 'asc' }],
      })
      .then((data) => this.mapParteListToDTOList(data));
  }

  async exists(id: number): Promise<ValidateRelationResult> {
    const exist = (await this.prisma.parte.count({ where: { id } })) > 0;
    return { isValid: exist, message: exist ? '' : 'No existe la parte.' };
  }

  async isRelated(value: number): Promise<RelationshipValidationResult> {
    const parte = await this.prisma.parte.findFirst({
      where: { id: value },
      select: { reclamos: true },
    });
    const cantReclamos = parte?.reclamos?.length ?? 0;
    return { hasRelations: cantReclamos > 0, message: cantReclamos > 0 ? 'Hay reclamos relacionados.' : '' };
  }

  async isUnique(idUsuario: number, filter: { id?: number; nroDocumento: string | undefined }): Promise<boolean> {
    let args = { idUsuario, nroDocumento: filter.nroDocumento } as ParteWhereInput;
    if (filter.id) {
      args = { ...args, id: { not: filter.id } };
    }
    return (await this.prisma.parte.count({ where: args })) === 0;
  }
}
