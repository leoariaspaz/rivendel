import { Injectable } from '@nestjs/common';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PatrocinantesService {
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

  getTotalCount() {
    return this.prisma.patrocinante.count();
  }
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
}
