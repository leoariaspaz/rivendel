import { ApiProperty } from "@nestjs/swagger/dist";
import { TipoDocumento } from "src/generated/prisma/client";

export class TipoDocumentoDto {
		@ApiProperty({ example: 1, description: 'ID del tipo de documento' })
		id!: number;

		@ApiProperty({ example: 'DNI', description: 'Sintético del tipo de documento' })
		sintetico!: string;

		@ApiProperty({ example: 'Documento Nacional de Identidad', description: 'Descripción del tipo de documento' })
		descripcion!: string;	
}