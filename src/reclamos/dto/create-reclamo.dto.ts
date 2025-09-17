export class CreateReclamoDto {
  id: number;
  rubros: string;
  idResolucion: number;
  fechaHoraInicio: Date;
  horaFin: Date;
  segundaFecha?: Date;
  segFechaHoraInicio?: Date;
  segHoraFin?: Date;
}
