import { ArrayUnique, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PartesReclamoDTO } from '../../partes-reclamos/dto/partes-reclamo.dto';
import { ValidateRelation } from 'src/validators/ValidateRelationConstraint';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';
import { PartesReclamoDTOList } from 'src/partes-reclamos/dto/partes-reclamos-dto-list';
import { TiptapDocument } from 'src/tiptap/tiptap-document.types';
import { IsTiptapDocument } from 'src/validators/ValidateTipTapDocument';

export class CreateReclamoDto {
  @IsNotEmpty({ message: 'Debe ingresar un número de reclamo.' })
  @IsInt({ message: 'El número debe ser un valor entero.' })
  @Min(1, { message: 'El número debe ser un valor positivo.' })
  @Type(() => Number)
  numero!: number;

  @IsString({ message: 'Los rubros ingresados son incorrectos.' })
  rubros!: string;

  @Min(0, { message: 'Debe ingresar una resolución.' })
  @ValidateRelation(ResolucionesService)
  idResolucion!: number;

  @Type(() => Date)
  @IsNotEmpty({ message: 'Debe ingresar la fecha y hora de inicio.' })
  fechaHoraInicio!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsNotEmpty({ message: 'La hora de fin no es válida.' })
  horaFin?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsNotEmpty({ message: 'Debe ingresar la fecha y hora de inicio.' })
  proximaAudiencia?: Date;

  @ArrayUnique((p: PartesReclamoDTO) => p.idParte, {
    message: 'No se pueden repetir reclamantes en un mismo reclamo.',
  })
  @IsOptional()
  @Type(() => PartesReclamoDTOList)
  reclamantes?: PartesReclamoDTOList;

  @ArrayUnique((p: PartesReclamoDTO) => p.idParte, {
    message: 'No se pueden repetir reclamados en un mismo reclamo.',
  })
  @IsOptional()
  @Type(() => PartesReclamoDTOList)
  reclamados?: PartesReclamoDTOList;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsTiptapDocument()
  clausulas?: TiptapDocument;
}
