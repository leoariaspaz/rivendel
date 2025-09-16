interface PatrocinanteDTO {
  id: number;
  nombre: string;
  nroMatricula: number;
}

export interface FindParteDTO {
  id: number;
  nroDocumento: string;
  cuil: string;
  nombre: string;
  domicilio: string;
  localidad: string;
  nroWhatsapp: string;
  idTipoDocumento: number;
  tipoDocumento: string;
  patrocinante: PatrocinanteDTO;
}
