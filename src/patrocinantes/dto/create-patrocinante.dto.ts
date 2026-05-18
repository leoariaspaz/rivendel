import { IsEmpty, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength, ValidateIf } from "class-validator";
import { Type } from 'class-transformer';
import { ValidateIfGreaterThanZero } from "src/users/decorators/validate-if-greather-than-zero.decorator";
import { ValidateIfIsString } from "src/users/decorators/validate-if-is-string.decorator";

export class CreatePatrocinanteDto {
  @IsString({ message: "El nombre es incorrecto." })
  @IsNotEmpty({ message: "Debe ingresar un nombre." })
  @MinLength(4, { message: 'El nombre es demasiado corto.' })
  nombre!: string;

  @IsNotEmpty({ message: "Debe ingresar un número de matrícula." })
  @IsInt({ message: 'El número de matrícula es incorrecto.' })
  @IsPositive({ message: 'El número de matrícula debe ser positivo.' })
  nroMatricula!: number;

  @ValidateIfIsString()
  @IsString({ message: "El domicilio es incorrecto." })
  @IsNotEmpty({ message: "Debe ingresar un domicilio." })
  @MinLength(4, { message: 'El domicilio es demasiado corto.' })  
  domicilio?: string;

  @ValidateIfIsString()
  @IsString({ message: "La localidad es incorrecta." })
  @IsNotEmpty({ message: "Debe ingresar una localidad." })
  @MinLength(4, { message: 'La localidad es demasiada corta.' })
  localidad?: string;

  @ValidateIfGreaterThanZero()
  @Type(() => Number)
  @IsInt({ message: 'El número de casillero es incorrecto.' })
  @IsPositive({ message: 'El número de casillero debe ser positivo.' })
  nroCasillero?: number;
}
