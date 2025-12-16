import {
  ArrayUnique,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { 
  Type,
} from 'class-transformer';
import { PartesReclamoDTO } from './partes-reclamo.dto';

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
  @Type(() => Date)
  @IsNotEmpty({ message: 'La hora de fin no es válida.' })
  horaFin?: Date;

  @ArrayUnique((p) => p.idParte, {
    message: 'No se pueden repetir reclamantes en un mismo reclamo.',
  })
  @IsOptional()
  @Type(() => Array<PartesReclamoDTO>)
  reclamantes?: PartesReclamoDTO[];

  @ArrayUnique((p) => p.idParte, {
    message: 'No se pueden repetir reclamados en un mismo reclamo.',
  })
  @IsOptional()
  @Type(() => Array<PartesReclamoDTO>)
  reclamados?: PartesReclamoDTO[];
}
