import { ReclamosListParteReclamoItemDTO } from './reclamos-list-parte-reclamo-item.dto';

interface UsuarioReclamo {
  nombre: string;
  nroHabilitacion: number;
}

export interface ReclamosListItemDTO {
  id: number;
  numero: number;
  fechaHoraInicio: Date;
  horaFin: Date | null;
  idResolucion: number;
  resolucion: string;
  proximaAudiencia: Date | null;
  partes: ReclamosListParteReclamoItemDTO[] | [];
  conciliador: UsuarioReclamo | null;
  idUsuario: number;
}
