import { Injectable } from '@nestjs/common';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PartesService {
  constructor(private prisma: PrismaService) {}

  create(createParteDto: CreateParteDto) {
    console.log('Creating parte with data:', createParteDto);
    return this.prisma.parte.create({
      data: {
        nombre: createParteDto.nombre,
        idTipoDocumento: createParteDto.idTipoDocumento,
        nroDocumento: createParteDto.nroDocumento,
        cuil: createParteDto.cuil,
        idPatrocinante: createParteDto.idPatrocinante,
        nroWhatsapp: createParteDto.nroWhatsapp,
        localidad: createParteDto.localidad,
      },
    });
  }

  findAll() {
    return this.prisma.parte.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.parte.findUnique({
      where: { id },
    });
  }

  update(id: number, updateParteDto: UpdateParteDto) {
    return this.prisma.parte.update({
      where: { id },
      data: {
        nombre: updateParteDto.nombre,
        idTipoDocumento: updateParteDto.idTipoDocumento,
        nroDocumento: updateParteDto.nroDocumento,
        cuil: updateParteDto.cuil,
        idPatrocinante: updateParteDto.idPatrocinante,
        nroWhatsapp: updateParteDto.nroWhatsapp,
        localidad: updateParteDto.localidad,
      },
    });
  }

  remove(id: number) {
    return this.prisma.parte.delete({
      where: { id },
    });
  }
}
