import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength, ValidateIf } from 'class-validator';
import { Match } from 'src/validators/MatchConstraint';
import { ValidateIfGreaterThanZero } from '../decorators/validate-if-greather-than-zero.decorator';

export class UpdateUserDTO {
  @IsNotEmpty({ message: 'Debe ingresar un nombre.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(5, { message: 'El nombre debe tener al menos 5 caracteres' })
  nombre!: string;

  @ValidateIfGreaterThanZero({ message: 'El número de habilitación debe ser mayor a cero.' })
  @IsNotEmpty({ message: 'Debe ingresar un número de habilitación.' })
  @Type(() => Number)
  @IsInt({ message: 'El número de habilitación debe ser un entero.' })
  @IsPositive({ message: 'El número de habilitación debe ser mayor a cero.' })
  nroHabilitacion!: number;

  @IsOptional()
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto.' })
  currentPassword!: string;

  @ValidateIf((dto: UpdateUserDTO) => dto.currentPassword !== undefined && dto.currentPassword !== '')
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres.' })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Debe ingresar una nueva contraseña.' })
  newPassword!: string;

  @ValidateIf((dto: UpdateUserDTO) => dto.newPassword !== undefined && dto.newPassword !== '')
  @IsString({ message: 'La repetición de la nueva contraseña debe ser una cadena de texto.' })
  @Match('newPassword', { message: 'Debe repetir la nueva contraseña 2 veces.' })
  @IsNotEmpty({ message: 'Debe repetir la nueva contraseña.' })
  passwordConfirmation!: string;
}
