import { CreatePatrocinanteDto } from '../dto/create-patrocinante.dto';

export class Patrocinante {
  nombre: string;
  nroMatricula: number;
  domicilio: string;
  localidad: string;
  nroCasillero: number;

  constructor(
    nombre: string,
    nroMatricula: number,
    domicilio: string,
    localidad: string,
    nroCasillero: number,
  ) {
    this.nombre = nombre;
    this.nroMatricula = nroMatricula;
    this.domicilio = domicilio;
    this.localidad = localidad;
    this.nroCasillero = nroCasillero;
  }

  fromDTO(dto: CreatePatrocinanteDto): Patrocinante {
    return new Patrocinante(
      dto.nombre,
      dto.nroMatricula,
      dto.domicilio,
      dto.localidad,
      dto.nroCasillero,
    );
  }
}
