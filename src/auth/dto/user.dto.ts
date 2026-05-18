import { ApiProperty } from "@nestjs/swagger"

export class UserDTO {
	@ApiProperty({ example: 1, description: 'ID del usuario' })
	id!: number;

	@ApiProperty({ example: 'usuario@corre.com', description: 'Email del usuario' })
	email!: string;
}