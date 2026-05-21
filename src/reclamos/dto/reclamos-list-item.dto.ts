import { ReclamosListParteReclamoItemDTO } from './reclamos-list-parte-reclamo-item.dto';

export interface ReclamosListItemDTO {
  id: number;
  numero: number;
  fechaHoraInicio: Date;
  horaFin: Date | null;
  idResolucion: number;
  resolucion: string;
  proximaAudiencia: Date | null;
  partes: ReclamosListParteReclamoItemDTO[] | [];
}
