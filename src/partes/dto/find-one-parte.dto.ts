interface PatrocinanteDTO {
  id: number;
  nombre: string;
  nroMatricula: number;
  domicilio: string | null;
  localidad: string | null;
}

export interface FindOneParteDTO {
  id: number;
  nroDocumento: string;
  cuil: string;
  nombre: string;
  domicilio: string;
  localidad: string;
  idTipoDocumento: number;
  tipoDocumento: string;
  patrocinante: PatrocinanteDTO;
  esApoderado: boolean;
}
