import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PatrocinantesService } from 'src/patrocinantes/patrocinantes.service';
import { TipdocsService } from 'src/tipdocs/tipdocs.service';
import { ValidateRelation } from 'src/validators/ValidateRelationConstraint';

export class CreateParteDto {
  @IsString({ message: 'El nombre es incorrecto.' })
  @MinLength(4, { message: 'El nombre es demasiado corto.' })
  @IsNotEmpty({ message: 'Debe ingresar un nombre.' })
  nombre!: string;

  @IsInt({ message: 'El tipo de documento es incorrecto.' })
  @IsPositive({ message: 'El signo del tipo de documento es incorrecto.' })
  @IsNotEmpty({ message: 'Ingrese un tipo de documento.' })
  @ValidateRelation(TipdocsService)
  idTipoDocumento!: number;

  @IsNotEmpty({ message: 'Debe ingresar un número de documento.' })
  @IsNumberString({}, { message: 'El documento tiene formato incorrecto.' })
  nroDocumento!: string;

  @ValidateIf((o: CreateParteDto) => o.cuil !== undefined && o.cuil !== null && o.cuil !== '')
  @IsString({ message: 'El CUIL tiene formato incorrecto.' })
  @Matches(/^\d{11}$/, { message: 'El CUIL debe constar de exactamente 11 números.' })  
  cuil?: string;

  @IsOptional()
  @MinLength(4, { message: 'El domicilio es demasiado corto.' })
  domicilio?: string;

  @IsOptional()
  @MinLength(4, { message: 'La localidad es demasiada corta.' })
  localidad?: string;

  @IsOptional()
  @IsInt({ message: 'El patrocinante es incorrecto.' })
  @ValidateRelation(PatrocinantesService)
  idPatrocinante?: number;

  @IsBoolean({ message: 'Debe indicar si es apoderado.' })
  esApoderado!: boolean;
}
