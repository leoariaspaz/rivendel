import { FindOneReclamoDTO, FindOneReclamoParteDTO } from '../dto/find-one-reclamo.dto';

class FindOneReclamoTipoDocumento {
  sintetico!: string;
}

class FindOneReclamoPatrocinante {
  domicilio?: string | null;
  localidad?: string | null;
  nombre!: string;
  nroCasillero?: number | null;
  nroMatricula!: number;
}

class FindOneReclamoParte {
  id!: number;
  cuil!: string;
  domicilio?: string | null;
  esApoderado!: boolean;
  localidad?: string | null;
  nombre!: string;
  nroDocumento!: string;
  patrocinante?: FindOneReclamoPatrocinante;
  tipoDocumento!: FindOneReclamoTipoDocumento;
}

class FindOneReclamoParteReclamo {
  idParte!: number;
  incomparendo!: boolean;
  multado!: boolean;
  nroWhatsappParte?: string | null;
  nroWhatsappPatrocinante?: string | null;
  postergo!: boolean;
  rol!: number;
  parte?: FindOneReclamoParte;

  toReclamante(): FindOneReclamoParteDTO {
    return new FindOneReclamoParteDTO();
  }

  toReclamado(): FindOneReclamoParteDTO {
    return new FindOneReclamoParteDTO();
  }
}

class FindOneReclamoParteReclamoList extends Array<FindOneReclamoParteReclamo> {
  toReclamantes(): FindOneReclamoParteDTO[] {
    return [];
  }

  toReclamados(): FindOneReclamoParteDTO[] {
    return [];
  }
}

export class FindOneReclamo {
  id!: number;
  numero!: number;
  fechaHoraInicio!: Date;
  horaFin?: Date | null;
  idResolucion!: number;
  proximaAudiencia?: Date | null;
  rubros!: string;
  partes?: FindOneReclamoParteReclamoList;
  //constructor(private reclamo: ParteReclamoDbDTO) {}

  toFindOneReclamoDTO(): FindOneReclamoDTO {
    const result = new FindOneReclamoDTO();
    result.id = this.id;
    result.numero = this.numero;
    result.fechaHoraInicio = this.fechaHoraInicio;
    result.horaFin = this.horaFin;
    result.idResolucion = this.idResolucion;
    result.rubros = this.rubros;
    result.proximaAudiencia = this.proximaAudiencia;
    result.reclamantes = this.partes?.toReclamantes();
    result.reclamados = this.partes?.toReclamados();

    return result;
  }
}
