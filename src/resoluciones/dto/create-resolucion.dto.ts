import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateResolucionDto {
  @IsNotEmpty({ message: "Debe ingresar una descripción." })
  @IsString({ message: "La descripción es incorrecta." })
  @MinLength(5, { message: 'La descripción es demasiado corta.' })  
  descripcion!: string;

  @IsString({ message: "El detalle es incorrecto." })
  @IsNotEmpty({ message: "Debe ingresar un detalle." })
  @MinLength(5, { message: 'El detalle es demasiado corto.' })
  detalle!: string;
}
