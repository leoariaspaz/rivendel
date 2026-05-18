import { ApiProperty } from "@nestjs/swagger";

export class PatrocinanteDto {
	@ApiProperty({ example: 1, description: 'ID del patrocinante' })
	id!: number;

	@ApiProperty({ example: 'Juan Pérez', description: 'Nombre del patrocinante' })
	nombre!: string;

	@ApiProperty({ example: '123456', description: 'Número de matrícula del patrocinante' })
	nroMatricula!: number;

	@ApiProperty({ example: 'Calle Falsa 123', description: 'Dirección del patrocinante', nullable: true })
	domicilio!: string | null;

	@ApiProperty({ example: 'Santiago del Estero, Capital', description: 'Localidad del domicilio del patrocinante', nullable: true })
	localidad!: string | null;

	@ApiProperty({ example: '1234', description: 'Número de casillero del patrocinante', nullable: true })
	nroCasillero!: number | null;
}
