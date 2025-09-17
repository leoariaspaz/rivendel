import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateReclamoDto {
  @IsNotEmpty({ message: 'Debe ingresar un sintético.' })
  @IsInt({ message: 'El número debe ser un valor entero.' })
  @Min(1, { message: 'El número debe ser un valor positivo.' })
  id: number;

  numero: number;
  rubros: string;
  idResolucion: number;
  fechaHoraInicio: Date;
  horaFin: Date;
  segundaFecha?: Date;
  segFechaHoraInicio?: Date;
  segHoraFin?: Date;
}
