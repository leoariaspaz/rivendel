import { FindParteReclamoDTO } from "./find-parte-reclamo.dto";

export interface FindReclamoDTO {
  id: number;
  numero: number;
  fechaHoraInicio: Date;
  horaFin: Date | null;
  idResolucion: number;
  resolucion: string;
  proximaAudiencia: Date | null;
  partes: FindParteReclamoDTO[] | [];
}