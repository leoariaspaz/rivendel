import { Injectable } from '@nestjs/common';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';
import { UpdateTipdocDto } from './dto/update-tipdoc.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class TipdocsService {
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
}
