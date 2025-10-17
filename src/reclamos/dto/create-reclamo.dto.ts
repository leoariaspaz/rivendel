import {
  ArrayUnique,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReclamoDto {
  id: number;

  @IsNotEmpty({ message: 'Debe ingresar un número de reclamo.' })
  @IsInt({ message: 'El número debe ser un valor entero.' })
  @Min(1, { message: 'El número debe ser un valor positivo.' })
  @Type(() => Number)
  numero: number;

  rubros: string;

  @Min(0, { message: 'Debe ingresar una resolución.' })
  idResolucion: number;

  @Type(() => Date)
  @IsNotEmpty({ message: 'Debe ingresar la fecha y hora de inicio.' })
  fechaHoraInicio: Date;

  @IsOptional()
  @IsDate({ message: 'La hora de fin no es válida.' })
  horaFin?: Date;

  @IsOptional()
  @IsDate({ message: 'La segunda fecha no es válida.' })
  segundaFecha?: Date;

  @IsOptional()
  @IsDate({ message: 'La segunda fecha y hora de inicio no es válida.' })
  segFechaHoraInicio?: Date;

  @IsOptional()
  @IsDate({ message: 'La segunda hora de fin no es válida.' })
  segHoraFin?: Date;

  @ArrayUnique((o) => Number(o), {
    message: 'No se pueden repetir reclamantes en un mismo reclamo.',
  })
  @IsOptional()
  reclamantes?: number[];

  @ArrayUnique((o) => Number(o), {
    message: 'No se pueden repetir reclamados en un mismo reclamo.',
  })
  @IsOptional()
  reclamados?: number[];
}
