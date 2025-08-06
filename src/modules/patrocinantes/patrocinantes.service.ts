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
        nroMatricula: createPatrocinanteDto.nroMatricula,
        domicilio: createPatrocinanteDto.domicilio,
        localidad: createPatrocinanteDto.localidad,
        nroCasillero: createPatrocinanteDto.nroCasillero,
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
        nroMatricula: updatePatrocinanteDto.nroMatricula,
        domicilio: updatePatrocinanteDto.domicilio,
        localidad: updatePatrocinanteDto.localidad,
        nroCasillero: updatePatrocinanteDto.nroCasillero,
      },
    });
  }

  remove(id: number) {
    return this.prisma.patrocinante.delete({
      where: { id },
    });
  }
}
