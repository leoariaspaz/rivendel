import { Injectable } from '@nestjs/common';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';
import { Patrocinante } from './entities/patrocinante.entity';

@Injectable()
export class PatrocinantesService {
  private patrocinantes: Patrocinante[] = [];

  create(createPatrocinanteDto: CreatePatrocinanteDto) {
    const patrocinante = new Patrocinante(
      createPatrocinanteDto.nombre,
      createPatrocinanteDto.nroMatricula,
      createPatrocinanteDto.domicilio,
      createPatrocinanteDto.localidad,
      createPatrocinanteDto.nroCasillero,
    );
    console.log('Creating patrocinante:', patrocinante);
  }

  findAll() {
    return this.patrocinantes;
  }

  findOne(id: number) {
    return `This action returns a #${id} patrocinante`;
  }

  update(id: number, updatePatrocinanteDto: UpdatePatrocinanteDto) {
    return `This action updates a #${id} patrocinante ${updatePatrocinanteDto.nombre}`;
  }

  remove(id: number) {
    return `This action removes a #${id} patrocinante`;
  }
}
