export interface ParteReclamoDbDTO {
  idParte: number;
  rol: number;
  nroWhatsappParte: string | null;
  nroWhatsappPatrocinante: string | null;
  postergo: boolean;
  incomparendo: boolean;
  multado: boolean;
  parte: {
    id: number;
    nombre: string;
    nroDocumento: string;
    cuil: string;
    domicilio: string | null;
    localidad: string | null;
    tipoDocumento: {
      sintetico: string | null;
    } | null;
    esApoderado: boolean;
    patrocinante: {
      nroMatricula: number;
      nroCasillero: number | null;
      nombre: string;
      localidad: string | null;
      domicilio: string | null;
    } | null;
  };
}
