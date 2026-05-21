import { ApiProperty } from "@nestjs/swagger";
import { FindParteDTO } from "./find-parte.dto";

export class PartesListDto {
	constructor(partes: FindParteDTO[], totalRecords: number) {
		this.data = partes;
		this.totalRecords = totalRecords;
	}

	@ApiProperty({ description: 'Lista de partes obtenida' })
	data!: FindParteDTO[];

	@ApiProperty({ description: 'Total de registros que coinciden con la búsqueda' })
	totalRecords!: number;
}