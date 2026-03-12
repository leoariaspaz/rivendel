import { IsDefined, isNotEmpty, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";
import { Match } from "src/validators/MatchConstraint";

export class UpdateUserDTO {
	@IsNotEmpty({ message: 'Debe ingresar un nombre.' })
	@IsString()
	@MinLength(5)
  nombre!: string;

	@IsOptional()
	@IsString({ message: "La contraseña actual debe ser una cadena de texto." })
  currentPassword!: string;

	@ValidateIf(dto => dto.currentPassword)
	@MinLength(6, { message: "La nueva contraseña debe tener al menos 6 caracteres."})
	@IsString({ message: "La nueva contraseña debe ser una cadena de texto." })
	@IsNotEmpty({ message: "Debe ingresar una nueva contraseña." })
	newPassword!: string;

	@IsOptional()
	@IsString({ message: "La repetición de la nueva contraseña debe ser una cadena de texto." })
	@Match("newPassword", { message: "Debe repetir la nueva contraseña 2 veces."})
	@IsNotEmpty({ message: "Debe repetir la nueva contraseña." })
	newPasswordRepeated!: string;
}
