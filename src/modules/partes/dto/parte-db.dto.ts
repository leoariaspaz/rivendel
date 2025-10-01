export interface ParteDB {
  id: number;
  nroDocumento: string;
  cuil: string;
  nombre: string;
  domicilio: string | null;
  localidad: string | null;
  nroWhatsapp: string | null;
  idTipoDocumento: number;
  tipoDocumento: {
    sintetico: string;
  };
  idPatrocinante: number | null;
  patrocinante: {
    nroMatricula: number;
    nombre: string;
  } | null;
}
