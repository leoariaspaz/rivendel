import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { FindOneReclamoDTO, FindOneReclamoParteDTO } from '../dto/find-one-reclamo.dto';
import { Type } from 'class-transformer';
import { TiptapDocument } from 'src/tiptap/tiptap-document.types';

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

  @Type(() => FindOneReclamoPatrocinante)
  patrocinante?: FindOneReclamoPatrocinante;

  @Type(() => FindOneReclamoTipoDocumento)
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

  @Type(() => FindOneReclamoParte)
  parte?: FindOneReclamoParte;

  toDTO(): FindOneReclamoParteDTO {
    const dto = new FindOneReclamoParteDTO();
    dto.id = this.idParte;
    dto.nroWhatsappParte = this.nroWhatsappParte;
    dto.nroWhatsappPatrocinante = this.nroWhatsappPatrocinante;
    dto.postergo = this.postergo;
    dto.incomparendo = this.incomparendo;
    dto.multado = this.multado;
    dto.nombre = this.parte?.nombre || '';
    dto.nroDocumento = this.parte?.nroDocumento || '';
    dto.cuil = this.parte?.cuil || '';
    dto.localidad = this.parte?.localidad || '';
    dto.domicilio = this.parte?.domicilio || '';
    dto.esApoderado = this.parte?.esApoderado || false;
    dto.tipoDocumento = { sintetico: this.parte?.tipoDocumento.sintetico || '' };
    if (this.parte?.patrocinante) {
      dto.patrocinante = {
        nroMatricula: this.parte?.patrocinante.nroMatricula || 0,
        nroCasillero: this.parte?.patrocinante.nroCasillero || 0,
        nombre: this.parte?.patrocinante.nombre || '',
        localidad: this.parte?.patrocinante.localidad || '',
        domicilio: this.parte?.patrocinante.domicilio || '',
      };
    }
    return dto;
  }
}

class UsuarioReclamo {
  nombre!: string;
  nroHabilitacion!: number;
}

export class FindOneReclamo {
  id!: number;
  numero!: number;
  fechaHoraInicio!: Date;
  horaFin?: Date | null;
  idResolucion!: number;
  proximaAudiencia?: Date | null;
  rubros!: string;
  googleEventId?: string | null;

  @Type(() => FindOneReclamoParteReclamo)
  partes?: FindOneReclamoParteReclamo[];

  @Type(() => UsuarioReclamo)
  usuario!: UsuarioReclamo;

  clausulas?: TiptapDocument;

  toDTOListByRol(rol: number): FindOneReclamoParteDTO[] | undefined {
    return this.partes?.filter((r) => r.rol === rol).map((r: FindOneReclamoParteReclamo) => r.toDTO());
  }

  toReclamantes(): FindOneReclamoParteDTO[] | undefined {
    return this.toDTOListByRol(RECLAMANTE);
  }

  toReclamados(): FindOneReclamoParteDTO[] | undefined {
    return this.toDTOListByRol(RECLAMADO);
  }

  toFindOneReclamoDTO(cantidad: number): FindOneReclamoDTO {
    const dto = new FindOneReclamoDTO();
    dto.id = this.id;
    dto.numero = this.numero;
    dto.fechaHoraInicio = this.fechaHoraInicio;
    dto.horaFin = this.horaFin;
    dto.idResolucion = this.idResolucion;
    dto.rubros = this.rubros;
    dto.proximaAudiencia = this.proximaAudiencia;
    dto.reclamantes = this.toReclamantes();
    dto.reclamados = this.toReclamados();
    dto.conciliador = {
      nombre: this.usuario.nombre,
      nroHabilitacion: this.usuario.nroHabilitacion,
    };
    dto.cantidad = cantidad;
    dto.clausulas = this.clausulas;
    dto.googleEventId = this.googleEventId;
    return dto;
  }
}
