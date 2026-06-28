import { TiptapDocument } from "src/tiptap/tiptap-document.types";

export class FindOneReclamoParteDTO {
  id!: number;
  nombre!: string;
  nroDocumento!: string;
  cuil!: string;
  localidad?: string | null;
  domicilio?: string | null;
  esApoderado!: boolean;
  multado!: boolean;
  nroWhatsappParte?: string | null;
  nroWhatsappPatrocinante?: string | null;
  postergo!: boolean;
  incomparendo!: boolean;
  tipoDocumento?: {
    sintetico: string | null;
  };
  patrocinante?: {
    nroMatricula: number;
    nroCasillero: number | null;
    nombre: string;
    localidad: string | null;
    domicilio: string | null;
  } | null;
}

class UsuarioReclamoDTO {
  nombre!: string;
  nroHabilitacion!: number;
}

export class FindOneReclamoDTO {
  id!: number;
  numero!: number;
  fechaHoraInicio!: Date;
  horaFin?: Date | null;
  idResolucion!: number;
  proximaAudiencia?: Date | null;
  rubros!: string;
  reclamantes?: FindOneReclamoParteDTO[];
  reclamados?: FindOneReclamoParteDTO[];
  conciliador!: UsuarioReclamoDTO;
  cantidad!: number;
  clausulas?: TiptapDocument;
}
