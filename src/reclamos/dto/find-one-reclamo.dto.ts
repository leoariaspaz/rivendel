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
  cantidad!: number;
}
