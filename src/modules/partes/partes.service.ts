import { Injectable } from '@nestjs/common';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ParteDB } from './dto/parte-db.dto';
import { FindParteDTO } from './dto/find-parte.dto';

@Injectable()
export class PartesService {
  constructor(private prisma: PrismaService) {}

  create(createParteDto: CreateParteDto) {
    const idPatrocinante = createParteDto.idPatrocinante
      ? Number(createParteDto.idPatrocinante)
      : null;
    return this.prisma.parte.create({
      data: {
        nombre: createParteDto.nombre,
        idTipoDocumento: Number(createParteDto.idTipoDocumento),
        nroDocumento: createParteDto.nroDocumento,
        cuil: String(createParteDto.cuil),
        idPatrocinante: idPatrocinante,
        nroWhatsapp: createParteDto.nroWhatsapp,
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
    nroWhatsapp: true,
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
        localidad: true
      },
    },
  } as const;

  async findAll() {
    const data = await this.prisma.parte.findMany({
      orderBy: { nombre: 'asc' },
      select: this.SELECT_FIELDS,
    });
    return this.selectPartes(data);
  }

  mapParteDBToFindParteDTO(p: ParteDB): FindParteDTO {
    const result = {
      id: p.id,
      nroDocumento: p.nroDocumento,
      cuil: p.cuil,
      nombre: p.nombre,
      domicilio: p.domicilio === null ? '' : p.domicilio,
      localidad: p.localidad === null ? '' : p.localidad,
      nroWhatsapp: p.nroWhatsapp === null ? '' : p.nroWhatsapp,
      idTipoDocumento: p.idTipoDocumento,
      tipoDocumento: p.tipoDocumento.sintetico,
    } as FindParteDTO;

    if (p.patrocinante) {
      result.patrocinante = {
        id: p.idPatrocinante || 0,
        nombre: p.patrocinante.nombre,
        nroMatricula: p.patrocinante.nroMatricula,
        domicilio: p.patrocinante.domicilio,
        localidad: p.patrocinante.localidad
      };
    }

    return result;
  }

  selectPartes(data: ParteDB[]): FindParteDTO[] {
    return data.map((p) => this.mapParteDBToFindParteDTO(p));
  }

  async findAllPaginated(page: number, limit: number): Promise<FindParteDTO[]> {
    const skip = (page - 1) * limit;
    const data = await this.prisma.parte.findMany({
      skip,
      take: Number(limit),
      orderBy: {
        nombre: 'asc',
      },
      select: this.SELECT_FIELDS,
    });

    return this.selectPartes(data);
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
    return this.prisma.parte.update({
      where: { id },
      data: {
        nombre: updateParteDto.nombre,
        idTipoDocumento: Number(updateParteDto.idTipoDocumento),
        nroDocumento: updateParteDto.nroDocumento,
        cuil: updateParteDto.cuil,
        idPatrocinante: Number(updateParteDto.idPatrocinante),
        nroWhatsapp: updateParteDto.nroWhatsapp,
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

  getTotalCount() {
    return this.prisma.parte.count();
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

  search(term: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.parte
      .findMany({
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
        orderBy: {
          nombre: 'asc',
        },
        select: this.SELECT_FIELDS,
        skip,
        take: Number(limit),
      })
      .then((data) => this.selectPartes(data));
  }
}
