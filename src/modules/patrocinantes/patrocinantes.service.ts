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

  findAll() {
    return this.prisma.patrocinante.findMany({
      orderBy: {
        nroMatricula: 'asc',
      },
    });
  }

  findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.patrocinante.findMany({
      skip,
      take: Number(limit),
      orderBy: {
        nroMatricula: 'asc',
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

  getTotalCount() {
    return this.prisma.patrocinante.count();
  }

  search(term: string) {
    return this.prisma.patrocinante.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: term,
            },
          },
          {
            nroMatricula: {
              equals: isNaN(Number(term)) ? undefined : Number(term),
            },
          },
          {
            domicilio: {
              contains: term,
            },
          },
          {
            localidad: {
              contains: term,
            },
          },
          {
            nroCasillero: {
              equals: isNaN(Number(term)) ? undefined : Number(term),
            },
          },
        ],
      },
      orderBy: [
        {
          nombre: 'asc',
        },
        {
          nroMatricula: 'asc',
        },
      ],
    });
  }
}
