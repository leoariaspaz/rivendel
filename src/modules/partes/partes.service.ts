import { Injectable } from '@nestjs/common';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ParteDB } from './dto/parte-db.dto';
import { FindParteDTO } from './dto/find-parte.dto';
import { ParteCountArgs, ParteFindManyArgs } from 'src/generated/prisma/models';
import {
  RelationshipValidation,
  RelationshipValidationResult,
} from '../../pipes/interfaces/relationship-validation.interface';
import { ShouldExistRelationValidation, ValidateRelationResult } from 'src/validators/interfaces';

@Injectable()
export class PartesService implements RelationshipValidation, ShouldExistRelationValidation {
  constructor(private prisma: PrismaService) {}

  create(createParteDto: CreateParteDto) {
    return this.prisma.parte.create({
      data: {
        nombre: createParteDto.nombre,
        idTipoDocumento: createParteDto.idTipoDocumento,
        nroDocumento: createParteDto.nroDocumento,
        cuil: createParteDto.cuil ?? '',
        idPatrocinante: createParteDto.idPatrocinante ?? null,
        esApoderado: createParteDto.esApoderado,
        domicilio: createParteDto.domicilio,
        localidad: createParteDto.localidad,
      },
    });
  }

  SELECT_FIELDS = {
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

  mapParteDBToFindParteDTO(p: ParteDB): FindParteDTO {
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
    } as FindParteDTO;

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

  selectPartes(data: ParteDB[]): FindParteDTO[] {
    return data.map(this.mapParteDBToFindParteDTO);
  }

  async findOne(id: number) {
    const p = await this.prisma.parte.findUnique({
      where: { id },
      select: this.SELECT_FIELDS,
    });

    if (p) return this.mapParteDBToFindParteDTO(p);
    return null;
  }

  update(id: number, updateParteDto: UpdateParteDto) {
    const idPatrocinante = updateParteDto.idPatrocinante ? Number(updateParteDto.idPatrocinante) : null;
    return this.prisma.parte.update({
      where: { id },
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

  remove(id: number) {
    return this.prisma.parte.delete({
      where: { id },
    });
  }

  getTotalCount(query: string | null) {
    let filter = {} as ParteCountArgs;
    if (query) {
      filter = {
        where: {
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
        },
      };
    }
    return this.prisma.parte.count(filter);
  }

  getFilteredTotalCount(term: string) {
    if (term) {
      return this.prisma.parte.count({
        where: {
          OR: [
            {
              nombre: {
                contains: term,
              },
            },
            {
              cuil: {
                contains: term,
              },
            },
          ],
        },
      });
    }
  }

  findAll(query: string | null, page: number | null, limit: number | null) {
    let filters: ParteFindManyArgs = {};

    if (page && limit && page > 0) {
      const skip = (page - 1) * limit;
      filters = { ...filters, skip, take: Number(limit) } as ParteFindManyArgs;
    }

    if (query) {
      filters = {
        ...filters,
        where: {
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
        },
      };
    }

    return this.prisma.parte
      .findMany({
        ...filters,
        select: this.SELECT_FIELDS,
      })
      .then((data) => this.selectPartes(data));
  }

  async exists(id: number): Promise<ValidateRelationResult> {
    const exist = (await this.prisma.parte.count({ where: { id } })) > 0;
    return { isValid: exist, message: exist ? '' : 'No existe la parte.' };
  }

  async validate(value: number): Promise<RelationshipValidationResult> {
    const parte = await this.prisma.parte.findFirst({ where: { id: value }, select: { reclamos: true } });
    const cantReclamos = parte?.reclamos?.length ?? 0;
    if (cantReclamos > 0) {
      return { isValid: false, message: 'Hay reclamos relacionados.' };
    } else {
      return { isValid: false, message: '' };
    }
  }
}
