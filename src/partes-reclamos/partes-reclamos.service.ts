import { Injectable } from '@nestjs/common';
import { CreatePartesReclamoDto } from './dto/create-partes-reclamo.dto';
import { UpdatePartesReclamoDto } from './dto/update-partes-reclamo.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PartesReclamosService {
  constructor(private prisma: PrismaService) {}

  create(createPartesReclamoDto: CreatePartesReclamoDto) {
    return this.prisma.partesReclamos.create({
      data: {
        idParte: Number(createPartesReclamoDto.idParte),
        idReclamo: Number(createPartesReclamoDto.idReclamo),
      },
    });
  }

  findAll() {
    return this.prisma.partesReclamos.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} partesReclamo`;
  }

  update(id: number, updatePartesReclamoDto: UpdatePartesReclamoDto) {
    return `This action updates a #${id} partesReclamo ${updatePartesReclamoDto.idParte}`;
  }

  remove(id: number) {
    return `This action removes a #${id} partesReclamo`;
  }
}
