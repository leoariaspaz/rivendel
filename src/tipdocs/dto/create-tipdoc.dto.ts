import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipdocDto {
  @IsString({ message: 'El sintético debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Debe ingresar un sintético.' })
  @MaxLength(50, {
    message: 'El sintético no debe exceder los 50 caracteres.',
  })
  sintetico!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Debe ingresar una descripción.' })
  descripcion!: string;
}
