import { ApiProperty } from "@nestjs/swagger/dist";

export class ParteDto {
	@ApiProperty({ example: 1, description: 'ID de la parte' })
  id!: number;

	@ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo de la parte' })
  nombre!: string;

	@ApiProperty({ example: '12345678', description: 'Número de documento de la parte' })
  idTipoDocumento!: number;

	@ApiProperty({ example: '20-12345678-9', description: 'CUIL de la parte' })
  nroDocumento!: string;

	@ApiProperty({ example: 'Calle Falsa 123', description: 'Domicilio de la parte', nullable: true })
  cuil!: string;

	@ApiProperty({ example: 'Calle Falsa 123', description: 'Domicilio de la parte', nullable: true })
  domicilio!: string | null;

	@ApiProperty({ example: 'Springfield', description: 'Localidad de la parte', nullable: true })
  localidad!: string | null;

	@ApiProperty({ example: 1, description: 'ID del tipo de documento' })
  idPatrocinante!: number | null;

	@ApiProperty({ example: true, description: 'Indica si la parte es apoderada' })
  esApoderado!: boolean;
}
