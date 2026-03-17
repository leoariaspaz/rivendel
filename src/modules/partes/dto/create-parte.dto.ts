import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { MustExistPatrocinante } from 'src/validators/MustExistPatrocinante';
import { MustExistTipoDocumento } from 'src/validators/MustExistTipoDocumento';

export class CreateParteDto {
  @IsString({ message: 'El nombre es incorrecto.' })
  @MinLength(4, { message: 'El nombre es demasiado corto.' })
  @IsNotEmpty({ message: 'Debe ingresar un nombre.' })
  nombre!: string;

  @IsInt({ message: 'El tipo de documento es incorrecto.' })
  @IsPositive({ message: 'El signo del tipo de documento es incorrecto.' })
  @IsNotEmpty({ message: 'Ingrese un tipo de documento.' })
  @MustExistTipoDocumento()
  idTipoDocumento!: number;

  @IsNotEmpty({ message: 'Debe ingresar un número de documento.' })
  @MinLength(7, { message: 'El número de documento tiene longitud incorrecta.' })
  @IsNumberString({}, { message: 'El documento tiene formato incorrecto.' })
  nroDocumento!: string;

  @ValidateIf((p) => p.cuil)
  @MinLength(11, { message: 'El cuil tiene longitud incorrecta' })
  cuil?: string;
  
  @IsOptional()
  @MinLength(4, { message: 'El domicilio es demasiado corto.' })
  domicilio?: string;
  
  @IsOptional()
  @MinLength(4, { message: 'La localidad es demasiada corta.' })
  localidad?: string;
  
  @IsOptional()
  @IsInt({ message: 'El patrocinante es incorrecto.' })
  @IsPositive()
  @MustExistPatrocinante()
  idPatrocinante?: number;

  @IsBoolean({ message: 'Debe indicar si es apoderado.' })
  esApoderado!: boolean;
}
