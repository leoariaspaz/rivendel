import { Injectable } from '@nestjs/common';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PatrocinantesService {
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

  async exists(id: number) {
    return (await this.prisma.patrocinante.findFirst({ where: { id: id } })) !== null;
  }
}
